export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export function telHref(phone: string) {
  return `tel:+1${phone.replace(/\D/g, "")}`;
}
