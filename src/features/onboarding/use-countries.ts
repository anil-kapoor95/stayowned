"use client";

import { useEffect, useState } from "react";
import { signupApi, type Country } from "@/lib/api/signup";

let cache: Country[] | null = null;
let pending: Promise<Country[] | null> | null = null;

function load() {
  pending ??= signupApi.countries().then((result) => {
    pending = null;
    if (result.ok) cache = result.data.countries;
    return result.ok ? result.data.countries : null;
  });
  return pending;
}

/** Active countries from the back office (loaded once per visit). */
export function useCountries() {
  const [countries, setCountries] = useState<Country[] | null>(cache);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (cache) return;
    let active = true;
    void load().then((list) => {
      if (!active) return;
      if (list) setCountries(list);
      else setFailed(true);
    });
    return () => {
      active = false;
    };
  }, []);

  return { countries, failed, retry: () => void load().then((list) => list && setCountries(list)) };
}

/** Best guess of the visitor's country id (India by default, as in the design). */
export function defaultCountryId(countries: Country[] | null, alpha2 = "IN"): string {
  return countries?.find((country) => country.alpha_2 === alpha2)?.id ?? "";
}
