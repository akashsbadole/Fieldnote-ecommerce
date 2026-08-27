import type { Order } from "./types";
import { formatPrice } from "./utils";

const BASE_STYLE = `
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  background-color: #f6f3ec;
  color: #1c1b17;
  padding: 32px 24px;
  max-width: 560px;
  margin: 0 auto;
`;

const HEADER = (eyebrow: string) => `
  <div style="border-bottom: 2px solid #2b3a2a; padding-bottom: 16px; margin-bottom: 24px;">
    <p style="font-size: 11px; letter-spacing: 0.1em; color: #b1461f; margin: 0 0 4px;">${eyebrow}</p>
    <p style="font-family: Georgia, serif; font-size: 26px; margin: 0; color: #1c1b17;">Fieldnote</p>
  </div>
`;

const FOOTER = `
  <p style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #dad3c2; font-size: 11px; color: #6e6858;">
    Fieldnote Supply Co. — gear tested outdoors, not in a studio.
  </p>
`;

export function welcomeEmail(name: string) {
  return `
    <div style="${BASE_STYLE}">
      ${HEADER("WELCOME")}
      <p style="font-size: 14px; line-height: 1.6;">Hi ${escapeHtml(name)},</p>
      <p style="font-size: 14px; line-height: 1.6;">
        Your Fieldnote account is set up. Browse the catalog, and remember —
        everything we sell comes with a lifetime repair program.
      </p>
      ${FOOTER}
    </div>
  `;
}

export function orderConfirmationEmail(order: Order, customerName: string) {
  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 6px 0; font-size: 13px;">${escapeHtml(item.productName)}${
          item.variant ? ` (${escapeHtml(item.variant)})` : ""
        } × ${item.quantity}</td>
        <td style="padding: 6px 0; font-size: 13px; text-align: right;">${formatPrice(
          item.price * item.quantity
        )}</td>
      </tr>`
    )
    .join("");

  return `
    <div style="${BASE_STYLE}">
      ${HEADER("ORDER CONFIRMED")}
      <p style="font-size: 14px; line-height: 1.6;">Hi ${escapeHtml(customerName)},</p>
      <p style="font-size: 14px; line-height: 1.6;">
        Order <strong>${order.id.toUpperCase()}</strong> is confirmed. Here's what's in it:
      </p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        ${itemRows}
      </table>
      <table style="width: 100%; border-top: 1px solid #dad3c2; padding-top: 8px; font-size: 13px;">
        <tr><td style="padding: 4px 0; color: #6e6858;">Subtotal</td><td style="text-align: right;">${formatPrice(order.subtotal)}</td></tr>
        <tr><td style="padding: 4px 0; color: #6e6858;">Shipping</td><td style="text-align: right;">${order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</td></tr>
        <tr><td style="padding: 4px 0; color: #6e6858;">Tax</td><td style="text-align: right;">${formatPrice(order.tax)}</td></tr>
        <tr><td style="padding: 8px 0 0; font-size: 15px; border-top: 1px solid #dad3c2;">Total</td><td style="text-align: right; padding-top: 8px; border-top: 1px solid #dad3c2; font-size: 15px;">${formatPrice(order.total)}</td></tr>
      </table>
      <p style="font-size: 13px; line-height: 1.6; margin-top: 20px;">
        Shipping to:<br/>
        ${escapeHtml(order.shippingAddress.fullName)}<br/>
        ${escapeHtml(order.shippingAddress.street)}<br/>
        ${escapeHtml(order.shippingAddress.city)}, ${escapeHtml(order.shippingAddress.state)} ${escapeHtml(order.shippingAddress.zip)}
      </p>
      ${FOOTER}
    </div>
  `;
}

export function orderStatusUpdateEmail(order: Order, customerName: string) {
  return `
    <div style="${BASE_STYLE}">
      ${HEADER("ORDER UPDATE")}
      <p style="font-size: 14px; line-height: 1.6;">Hi ${escapeHtml(customerName)},</p>
      <p style="font-size: 14px; line-height: 1.6;">
        Order <strong>${order.id.toUpperCase()}</strong> is now
        <strong>${order.status}</strong>.
        ${order.trackingNumber ? `Tracking number: ${escapeHtml(order.trackingNumber)}` : ""}
      </p>
      ${FOOTER}
    </div>
  `;
}

export function passwordResetEmail(resetUrl: string) {
  return `
    <div style="${BASE_STYLE}">
      ${HEADER("PASSWORD RESET")}
      <p style="font-size: 14px; line-height: 1.6;">
        Someone requested a password reset for this email. If that was you,
        click below — this link expires in 1 hour.
      </p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}" style="background: #b1461f; color: #f6f3ec; padding: 12px 20px; text-decoration: none; font-size: 13px; display: inline-block;">
          Reset password
        </a>
      </p>
      <p style="font-size: 12px; color: #6e6858;">
        If you didn't request this, you can ignore this email.
      </p>
      ${FOOTER}
    </div>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
