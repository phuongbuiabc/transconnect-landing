import { useRef, useState, type FormEvent } from 'react';
import { submitApplication, SubmissionError, type Receipt } from './api';
const fields = [{ key: 'name', label: 'Tên đơn vị vận tải', placeholder: 'Nhập tên doanh nghiệp / nhà xe', max: 200, type: 'text', auto: 'organization' }, { key: 'registrationNumber', label: 'Mã đăng ký kinh doanh', placeholder: 'Nhập mã đăng ký của đơn vị', max: 100, type: 'text', auto: 'off' }, { key: 'ownerEmail', label: 'Email chủ đơn vị', placeholder: 'ten@doanhnghiep.vn', max: 256, type: 'email', auto: 'email' }] as const;
export default function PartnerForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const inFlight = useRef(false);
  const message = useRef<HTMLDivElement>(null);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const input = { name: String(data.get('name') || '').trim(), registrationNumber: String(data.get('registrationNumber') || '').trim(), ownerEmail: String(data.get('ownerEmail') || '').trim() };
    const local: Record<string, string[]> = {};
    for (const field of fields) if (!input[field.key]) local[field.key] = ['Vui lòng nhập thông tin này.'];
    setErrors(local); setError('');
    if (Object.keys(local).length) return;
    inFlight.current = true; setBusy(true);
    try { setReceipt(await submitApplication(input)); }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi đăng ký.');
      if (err instanceof SubmissionError) setErrors(Object.fromEntries(Object.entries(err.fields).map(([key, value]) => [key.charAt(0).toLowerCase() + key.slice(1), Array.isArray(value) ? value : ['Thông tin chưa hợp lệ.']])));
    } finally { setBusy(false); inFlight.current = false; requestAnimationFrame(() => message.current?.focus()); }
  }
  if (receipt) return <div className="receipt" ref={message} tabIndex={-1} role="status"><span className="success-icon">✓</span><p className="eyebrow">ĐÃ TIẾP NHẬN</p><h3>Cảm ơn {receipt.name}!</h3><p>Hồ sơ của đơn vị đã được gửi thành công. Đội ngũ VieGo sẽ xem xét thông tin trước khi kích hoạt quan hệ đối tác.</p><div className="reference"><span>Mã hồ sơ</span><strong>{receipt.id}</strong><span>Trạng thái khi tiếp nhận: {receipt.reviewStatus === 'Pending' ? 'Chờ xét duyệt' : receipt.reviewStatus}</span></div><p className="small">Hãy lưu mã hồ sơ này. Trang hiện chưa hỗ trợ tra cứu trạng thái trực tuyến.</p></div>;
  return <form onSubmit={onSubmit} className="partner-form" aria-busy={busy}><h3>Bắt đầu hợp tác</h3><p>Để lại thông tin đơn vị của bạn.</p><div ref={message} tabIndex={-1}>{error && <p className="form-error" role="alert">{error}</p>}</div><fieldset disabled={busy}>{fields.map(field => <div className="field" key={field.key}><label htmlFor={field.key}>{field.label} <span aria-hidden="true">*</span></label><input id={field.key} name={field.key} type={field.type} maxLength={field.max} autoComplete={field.auto} placeholder={field.placeholder} required aria-invalid={!!errors[field.key]} aria-describedby={errors[field.key] ? field.key + '-error' : undefined}/>{errors[field.key] && <p className="field-error" id={field.key + '-error'}>{errors[field.key].join(' ')}</p>}</div>)}<p className="form-note">Thông tin được sử dụng để tiếp nhận và xét duyệt hồ sơ đối tác. Email cần thuộc chủ đơn vị vận tải.</p><button className="button primary submit" type="submit">{busy ? 'Đang gửi hồ sơ…' : 'Gửi đăng ký đối tác'} <span aria-hidden="true">↗</span></button></fieldset><p className="small required-note">* Thông tin bắt buộc</p></form>;
}
