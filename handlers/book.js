import { route, withCallId } from '../lib/http.js';
import { getDb } from '../lib/db.js';
import { bookLead } from '../lib/store.js';
import { notifyBooking } from '../lib/handoff.js';

// Voice agent tool: called once a lead is qualified. Picks the next designer, books the slot,
// messages the designer on Telegram and pushes the lead to the CRM.
export default route({}, async (req) => {
  const lead = withCallId(req.body || {});
  // A booking without these is useless to the designer. Hand the agent a next step instead of booking half a lead.
  const ask = { caller_name: 'their name', caller_phone: 'their mobile number', project_type: 'what they want done', area: 'where the property is' };
  const missing = Object.keys(ask).filter((k) => !String(lead[k] ?? '').trim());
  if (missing.length) {
    return {
      booked: false,
      missing,
      next_step: `Do not book yet. Ask the caller for ${missing.map((k) => ask[k]).join(' and ')}, then call this tool again with every detail they gave you.`,
    };
  }
  const booking = await bookLead(getDb(), lead);
  if (booking.error) return { booked: false, spoken: 'Our team will call you shortly to fix a time.', ...booking };
  if (booking.repeated) return { booked: true, repeated: true, spoken: booking.spoken };

  return {
    booked: true,
    designer: booking.designer_name,
    tier: booking.tier,
    slot: booking.slot,
    window_missed: booking.window_missed,
    spoken: booking.spoken,
    notifications: await notifyBooking(lead, booking),
  };
});
