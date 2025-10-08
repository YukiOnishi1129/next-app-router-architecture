import { GuestLayoutWrapper } from "@/shared/components/layout/server/GuestLayoutWrapper";

export default function GuestLayout(props: LayoutProps<"/">) {
  return <GuestLayoutWrapper>{props.children}</GuestLayoutWrapper>;
}
