"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, LazyMotion, domAnimation, m } from "motion/react";
import { Button } from "@/components/ui/Button";
import { ChoiceCards, FormSuccess, Honeypot, TextArea, TextField } from "./fields";
import { submitStartProject } from "@/lib/forms/actions";
import {
  budgets,
  cities,
  lotStatus,
  projectTypes,
  startProjectSchema,
  startWindows,
  type StartProjectData,
  type StartProjectInput,
} from "@/lib/forms/schemas";
import { track } from "@/lib/analytics";
import { useReducedMotion } from "@/lib/motion/useReducedMotion";

const steps = [
  { title: "Project", fields: ["projectType"] },
  { title: "Location", fields: ["city", "cityOther", "lot"] },
  { title: "Budget & timing", fields: ["budget", "start"] },
  { title: "Contact", fields: ["name", "email", "phone", "message"] },
] as const;

export function StartProjectForm() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    setError,
    control,
    formState: { errors },
  } = useForm<StartProjectInput, unknown, StartProjectData>({
    resolver: zodResolver(startProjectSchema),
    mode: "onTouched",
    defaultValues: { website: "", message: "", phone: "", cityOther: "", ref: "", startedAt: 0 },
  });

  useEffect(() => {
    setValue("startedAt", Date.now());
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) setValue("ref", ref.slice(0, 80));
  }, [setValue]);

  const values = useWatch({ control });
  const isLast = step === steps.length - 1;

  const goTo = (n: number) => {
    setStep(n);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const next = async () => {
    const ok = await trigger(steps[step].fields as unknown as (keyof StartProjectInput)[], {
      shouldFocus: true,
    });
    if (ok) goTo(step + 1);
  };

  const onSubmit = (data: StartProjectData) => {
    setServerError(null);
    startTransition(async () => {
      const res = await submitStartProject(data);
      if (res.ok) {
        track({ name: "lead_submit", type: data.projectType, form: "start_project" });
        setDone(true);
        requestAnimationFrame(() =>
          successRef.current?.querySelector<HTMLElement>("[role=status]")?.focus(),
        );
      } else {
        setServerError(res.error);
        if (res.fieldErrors) {
          for (const [field, msgs] of Object.entries(res.fieldErrors)) {
            setError(field as keyof StartProjectInput, { message: msgs?.[0] });
          }
          const firstBad = steps.findIndex((s) => s.fields.some((f) => res.fieldErrors?.[f]));
          if (firstBad >= 0) goTo(firstBad);
        }
      }
    });
  };

  if (done) {
    return (
      <div ref={successRef}>
        <FormSuccess title="Thank you. We've got it.">
          <p>
            We&rsquo;ll review your project and get back to you to talk through next steps. A
            confirmation is on its way to your inbox.
          </p>
        </FormSuccess>
      </div>
    );
  }

  const err = (k: keyof StartProjectInput) => errors[k]?.message as string | undefined;

  return (
    <LazyMotion features={domAnimation} strict>
      <form
        onSubmit={(e) => handleSubmit(onSubmit)(e)}
        noValidate
        className="relative"
        aria-label="Start a project"
        data-testid="start-project-form"
      >
        <Honeypot {...register("website")} />

        <ol className="grid grid-cols-4 gap-2" aria-label="Form progress">
          {steps.map((s, i) => (
            <li key={s.title} aria-current={i === step ? "step" : undefined}>
              <span
                className={`block h-px w-full transition-colors duration-500 ${i <= step ? "bg-fg-strong" : "bg-rule"}`}
              />
              <span
                className={`mt-3 hidden text-small sm:block ${i === step ? "text-fg-strong" : "text-fg-muted"}`}
              >
                {s.title}
              </span>
            </li>
          ))}
        </ol>

        <h2 ref={headingRef} tabIndex={-1} className="mt-10 font-display text-h3 outline-none">
          <span className="sr-only">Step {step + 1} of 4: </span>
          {
            ["What are you building?", "Where is it?", "Budget and timing", "How do we reach you?"][
              step
            ]
          }
        </h2>

        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={step}
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 space-y-10"
          >
            {step === 0 && (
              <ChoiceCards
                legend="Project type"
                name="projectType"
                options={projectTypes}
                value={values.projectType}
                error={err("projectType")}
                inputProps={register("projectType")}
              />
            )}
            {step === 1 && (
              <>
                <ChoiceCards
                  legend="City"
                  name="city"
                  options={cities}
                  value={values.city}
                  error={err("city")}
                  inputProps={register("city")}
                />
                {values.city === "other" && (
                  <TextField
                    label="Where is the project?"
                    error={err("cityOther")}
                    {...register("cityOther")}
                  />
                )}
                <ChoiceCards
                  legend="Do you already own the lot?"
                  name="lot"
                  options={lotStatus}
                  value={values.lot}
                  error={err("lot")}
                  inputProps={register("lot")}
                />
              </>
            )}
            {step === 2 && (
              <>
                <ChoiceCards
                  legend="Budget range"
                  name="budget"
                  options={budgets}
                  value={values.budget}
                  error={err("budget")}
                  inputProps={register("budget")}
                />
                <ChoiceCards
                  legend="Target start"
                  name="start"
                  options={startWindows}
                  value={values.start}
                  error={err("start")}
                  inputProps={register("start")}
                />
              </>
            )}
            {step === 3 && (
              <div className="grid gap-8 sm:grid-cols-2">
                <TextField
                  label="Name"
                  autoComplete="name"
                  error={err("name")}
                  {...register("name")}
                />
                <TextField
                  label="Email"
                  type="email"
                  autoComplete="email"
                  error={err("email")}
                  {...register("email")}
                />
                <TextField
                  label="Phone"
                  type="tel"
                  autoComplete="tel"
                  optional
                  error={err("phone")}
                  {...register("phone")}
                  className="sm:col-span-2"
                />
                <TextArea
                  label="Tell us about the project"
                  optional
                  error={err("message")}
                  {...register("message")}
                  className="sm:col-span-2"
                />
              </div>
            )}
          </m.div>
        </AnimatePresence>

        {serverError && (
          <p role="alert" className="mt-8 border-l-2 border-[#A1361F] pl-4 text-[#A1361F]">
            {serverError}
          </p>
        )}

        <div className="mt-12 flex items-center justify-between gap-4 border-t border-rule pt-8">
          {step > 0 ? (
            <Button variant="text" onClick={() => goTo(step - 1)} magnetic={false}>
              Back
            </Button>
          ) : (
            <span className="text-small text-fg-muted">Step 1 of 4</span>
          )}
          {isLast ? (
            <Button key="submit" type="submit" arrow disabled={pending}>
              {pending ? "Sending…" : "Send project details"}
            </Button>
          ) : (
            <Button key="next" onClick={next} arrow>
              Continue
            </Button>
          )}
        </div>
      </form>
    </LazyMotion>
  );
}
