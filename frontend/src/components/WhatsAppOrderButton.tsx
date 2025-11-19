import React from 'react';
const WhatsAppOrderButton:React.FC<{phone?:string, message:string}> = ({phone, message}) => {
  const phoneParam = phone ? phone.replace(/[^0-9+]/g, '') : '';
  const href = `https://wa.me/${phoneParam}?text=${encodeURIComponent(message)}`;
  return <a href={href} target='_blank' rel='noreferrer' style={{textDecoration:'none'}}>Order via WhatsApp</a>
}
export default WhatsAppOrderButton;
