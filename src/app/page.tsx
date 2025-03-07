import Image from "next/image";
import StatusCard from "@/components/StatusCard";
export default function Home() {
  return (
    <StatusCard name="Mumbai Stationary" status="Online" pages={3} />
  );
}
