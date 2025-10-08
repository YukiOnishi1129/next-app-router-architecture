import { NeutralLayoutWrapper } from "@/shared/components/layout/server/NeutralLayoutWrapper";

export default function NeutralLayout(props: LayoutProps<"/">) {
  return <NeutralLayoutWrapper>{props.children}</NeutralLayoutWrapper>;
}
