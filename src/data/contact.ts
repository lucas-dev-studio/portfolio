export const whatsappNumber = "5511965117938";
export const whatsappLabel = "(11) 96511-7938";
export function whatsappUrl(service = "um projeto") {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Olá, Lucas! Vi seu portfólio e gostaria de conversar sobre ${service}.`)}`;
}
