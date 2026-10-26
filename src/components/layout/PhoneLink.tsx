"use client";

import type { ComponentPropsWithoutRef } from "react";
import { track } from "@/lib/analytics";
import { telHref } from "@/lib/utils";

type Props = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  phone: string;
  /** where on the page the link lives, for analytics */
  location: string;
};

export function PhoneLink({ phone, location, children, onClick, ...rest }: Props) {
  return (
    <a
      href={telHref(phone)}
      onClick={(e) => {
        track({ name: "phone_click", location });
        onClick?.(e);
      }}
      {...rest}
    >
      {children ?? phone}
    </a>
  );
}
