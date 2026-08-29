import { getElectives } from "@/actions/eletivas.actions";
import EletivasClient from "./eletivas-client";

export const dynamic = "force-dynamic";

export default async function EletivasPage() {
  const electives = await getElectives();

  return <EletivasClient electives={electives} />;
}
