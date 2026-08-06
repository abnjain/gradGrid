"use client";

import React from "react";
import { siteConfig } from "@/lib/seo";
import { useToast } from "@/components/ui/toast";
import { Input, type InputHandle } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Send, User } from "lucide-react";

export function ContactForm() {
  const { contact } = siteConfig;
  const { addToast } = useToast();

  const [form, setForm] = React.useState({ name: "", email: "", message: "" });
  const [messageError, setMessageError] = React.useState<string | undefined>();

  // Refs to Input handles — validation lives inside the Input component.
  const nameRef = React.useRef<InputHandle>(null);
  const emailRef = React.useRef<InputHandle>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nameOk = nameRef.current?.validate() ?? true;
    const emailOk = emailRef.current?.validate() ?? true;
    const messageErr = form.message.trim() ? undefined : "Message is required";
    setMessageError(messageErr);
    if (!nameOk || !emailOk || messageErr) return;

    const subject = encodeURIComponent(`[${siteConfig.name}] Message from ${form.name.trim()}`);
    const body = encodeURIComponent(
      `Name: ${form.name.trim()}\nEmail: ${form.email.trim()}\n\n${form.message.trim()}`
    );
    window.location.href = `mailto:${contact.supportEmail}?subject=${subject}&body=${body}`;
    addToast({
      variant: "success",
      title: "Opening your email app",
      description: "We'll get back to you as soon as we can.",
    });
  }

  return (
    <div className="md:col-span-3 bg-surface border border-border rounded-2xl p-6 md:p-8">
      <h2 className="text-lg font-bold font-display text-ink mb-1 flex items-center gap-2">
        <Send className="w-5 h-5 text-brand" />
        Send us a message
      </h2>
      <p className="text-xs text-mid mb-6">
        Fill in the form and we&rsquo;ll reply at <span className="text-brand">{contact.supportEmail}</span>.
      </p>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input
            ref={nameRef}
            label="Your name"
            placeholder="Jane Doe"
            required
            validation="name"
            requiredMessage="Name is required"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            iconLeft={<User className="w-4 h-4" />}
          />
          <Input
            ref={emailRef}
            label="Your email"
            type="email"
            placeholder="you@institution.edu"
            required
            validation="email"
            requiredMessage="Email is required"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            iconLeft={<Mail className="w-4 h-4" />}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-charcoal">Message</label>
          <textarea
            required
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="How can we help?"
            className="w-full rounded-md border border-border-strong bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-mist focus:outline-2 focus:outline-brand focus:border-brand transition-colors resize-y"
          />
          {messageError && <p className="text-xs text-danger">{messageError}</p>}
        </div>
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          Send Message
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
