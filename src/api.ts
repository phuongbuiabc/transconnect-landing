export interface Application { name: string; registrationNumber: string; ownerEmail: string }
export interface Receipt { id: string; name: string; reviewStatus: string }
export class SubmissionError extends Error {
  constructor(message: string, public fields: Record<string, string[]> = {}) { super(message); }
}
export async function submitApplication(input: Application): Promise<Receipt> {
  const base = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '');
  if (!base) throw new SubmissionError('Chưa thể tiếp nhận đăng ký lúc này. Vui lòng quay lại sau.');
  let response: Response;
  try {
    response = await fetch(base + '/organizations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal: AbortSignal.timeout(20000) });
  } catch { throw new SubmissionError('Không kết nối được hệ thống. Vui lòng kiểm tra mạng và thử lại.'); }
  let body: unknown;
  try { body = await response.json(); } catch { throw new SubmissionError('Hệ thống trả về phản hồi không hợp lệ. Vui lòng thử lại sau.'); }
  if (!body || typeof body !== 'object' || !('succeeded' in body)) throw new SubmissionError('Không thể xác nhận kết quả đăng ký. Vui lòng thử lại sau.');
  const data = body as { succeeded: boolean; message?: string; data?: Receipt; errors?: Record<string, string[]> };
  if (!response.ok || data.succeeded !== true) {
    const messages: Record<number, string> = { 400: 'Vui lòng kiểm tra lại thông tin đăng ký.', 409: 'Thông tin đăng ký đã tồn tại. Vui lòng kiểm tra mã đăng ký hoặc email.', 429: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng chờ một lúc rồi thử lại.' };
    const errors = data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors) ? data.errors : {};
    throw new SubmissionError(data.message || messages[response.status] || 'Chưa thể gửi đăng ký. Vui lòng thử lại sau.', errors);
  }
  if (!data.data || typeof data.data.id !== 'string' || typeof data.data.name !== 'string' || typeof data.data.reviewStatus !== 'string') throw new SubmissionError('Không thể xác nhận mã hồ sơ. Vui lòng kiểm tra với đơn vị quản trị trước khi gửi lại.');
  return data.data;
}
