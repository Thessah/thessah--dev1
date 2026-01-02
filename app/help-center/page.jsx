export default function HelpCenter() {
  return (
    <div className="help-center-container" style={{ minHeight: '60vh', background: '#f7f8fa', padding: '40px 0' }}>
      <div className="help-center-content" style={{ maxWidth: 700, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#222', marginBottom: 16 }}>Help Center</h1>
        <p style={{ color: '#444', fontSize: 16, marginBottom: 24 }}>
          Welcome to the QuickFynd Help Center! Here you can find answers to common questions, get support, and learn how to make the most of your shopping experience.
        </p>
        <ul style={{ color: '#333', fontSize: 15, lineHeight: 1.7, paddingLeft: 20 }}>
          <li>Order Tracking & Delivery</li>
          <li>Returns, Refunds & Cancellations</li>
          <li>Payment & Security</li>
          <li>Account & Login Issues</li>
          <li>Offers, Coupons & Pricing</li>
          <li>Contact Customer Support</li>
        </ul>
        <div style={{ marginTop: 32, color: '#666', fontSize: 14 }}>
          Can't find what you're looking for? Email us at <a href="mailto:care@quickfynd.com" style={{ color: '#e60023', fontWeight: 600 }}>care@quickfynd.com</a>
        </div>
      </div>
    </div>
  );
}
