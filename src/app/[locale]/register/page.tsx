import { RegisterForm } from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-coffee">Customer account</p>
      <h1 className="mt-2 font-serif text-5xl font-bold text-forest">Register</h1>
      <p className="mt-4 max-w-3xl leading-7 text-forest/72">
        Create a customer account for future order history and faster checkout. Accounts are powered by Supabase Auth.
      </p>
      <RegisterForm />
    </section>
  );
}
