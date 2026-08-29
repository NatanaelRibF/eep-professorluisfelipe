import { getClassGroups } from "@/actions/class.actions";
import NovoConselhoClient from "./novo-conselho-client";

export const dynamic = "force-dynamic";

export default async function NovoConselhoPage() {
  const classes = await getClassGroups();

  return <NovoConselhoClient classes={classes} />;
}
