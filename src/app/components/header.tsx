import { UserAvatar } from "@/components/ui/user-avatar";
import { Separator } from "@/components/ui/separator";

export const Header = () => {

  return (
    <div>
      <div className="flex h-[60px] items-center">
      <div className="grow"></div>
      <div className="flex items-center justify-center gap-4"></div>
        <UserAvatar/>
      </div>
      <Separator className="mt-1" />
    </div>
  )
}
