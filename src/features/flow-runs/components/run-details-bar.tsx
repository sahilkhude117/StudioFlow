import { QuestionMarkIcon } from "@radix-ui/react-icons";
import { ApFlagId, FlowRun, FlowRunStatus } from "../../../../shared/src";
import React from "react";
import { flowRunUtils } from "../lib/flow-run-utils";
import { flagsHooks } from "@/hooks/flags-hooks";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileQuestion } from "lucide-react";

type RunDetailsBarProps = {
    run?: FlowRun;
    canExitRun: boolean;
    exitRun: (userHasPermissionToUpdateFlow: boolean) => void;
    isLoading: boolean;
};

function getStatusText(
    status: FlowRunStatus,
    timeout: number,
    memoryLimit: number,
  ) {
    switch (status) {
      case FlowRunStatus.STOPPED:
      case FlowRunStatus.SUCCEEDED:
        return ('Run Succeeded');
      case FlowRunStatus.FAILED:
        return ('Run Failed');
      case FlowRunStatus.PAUSED:
        return ('Flow Run is paused');
      case FlowRunStatus.QUOTA_EXCEEDED:
        return ('Run Failed due to quota exceeded');
      case FlowRunStatus.MEMORY_LIMIT_EXCEEDED:
        return (
          `Run failed due to exceeding the memory limit of ${memoryLimit} MB`
        );
      case FlowRunStatus.RUNNING:
        return ('Running');
      case FlowRunStatus.TIMEOUT:
        return (`Run exceeded ${timeout} seconds, try to optimize your steps.`);
      case FlowRunStatus.INTERNAL_ERROR:
        return ('Run failed for an unknown reason, contact support.');
    }
}

const RunDetailsBar = React.memo(
    ({ run, canExitRun, exitRun, isLoading }: RunDetailsBarProps) => {
        const { Icon, variant } = run?.status
            ? flowRunUtils.getStatusIcon(run.status)
            : { Icon: FileQuestion, variant: 'default' };

        const { data: timeoutSeconds } = flagsHooks.useFlag<number>(
            ApFlagId.FLOW_RUN_TIME_SECONDS,
        );
        const { data: memoryLimit } = flagsHooks.useFlag<number>(
            ApFlagId.FLOW_RUN_MEMORY_LIMIT_KB,
        );
        const userHasPermissionToEditFlow = true;

        if (!run) {
            return <></>;
        }

        return (
            <div className="fixed bottom-4 p-4 left-1/2 transform -translate-x-1/2 w-[400px] bg-background shadow-lg border h-16 flex items-center justify-start 
       rounded-lg z-[9999]">
                {<Icon
                    className={cn('w-6 h-6 mr-3', {
                        'text-foreground': variant === 'default',
                        'text-success': variant === 'success',
                        'text-destructive': variant === 'error',
                    })}
                />}
                <div className="flex-col flex flex-grow text-foreground gap-0">
                    <div className="text-sm">
                        {getStatusText(run.status, timeoutSeconds ?? -1, memoryLimit ?? -1)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {run?.id ?? ('Unknown')}
                    </div>
                </div>
                {canExitRun && (
                    <Button
                        variant={'outline'}
                        onClick={() => exitRun(userHasPermissionToEditFlow)}
                        loading={isLoading}
                        onKeyboardShortcut={() => exitRun(userHasPermissionToEditFlow)}
                        keyboardShortcut="Esc"
                    >Exit Run</Button>
                )}
            </div>
        )
    }
)

RunDetailsBar.displayName = 'RunDetailsBar';
export { RunDetailsBar };
