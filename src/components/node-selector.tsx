"use client";

import { createId } from "@paralleldrive/cuid2";
import { useReactFlow } from "@xyflow/react";
import { GlobeIcon, MousePointerIcon } from "lucide-react";
import Image from "next/image";
import { useCallback } from "react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NodeType } from "@/generated/prisma/enums";

export type NodeTypeOption = {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }> | string;
};

const triggerNodes: NodeTypeOption[] = [
  {
    type: NodeType.MAMUAL_TRIGGER,
    label: "Trigger Manually",
    description:
      "Runs the flow on clicking a button. Good for getting started quickly.",
    icon: MousePointerIcon,
  },
];

const executionNodes: NodeTypeOption[] = [
  {
    type: NodeType.HTTP_REQUEST,
    label: "HTTP Request",
    description: "Makes an HTTP request to a URL. Good for making API calls.",
    icon: GlobeIcon,
  },
];

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function NodeSelector({
  open,
  onOpenChange,
  children,
}: NodeSelectorProps) {
  const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();

  const handleNodeSelect = useCallback(
    (selection: NodeTypeOption) => {
      if (selection.type === NodeType.MAMUAL_TRIGGER) {
        const nodes = getNodes();
        const hasManualTrigger = nodes.some(
          (node) => node.type === NodeType.MAMUAL_TRIGGER,
        );
        if (hasManualTrigger) {
          toast.error("Only one Trigger node is allowed per workflow");
          return;
        }
      }
      setNodes((nodes) => {
        const hasInitialNode = nodes.some(
          (node) => node.type === NodeType.INITIAL,
        );

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const flowPosition = screenToFlowPosition({
          x: centerX + (Math.random() - 0.5) * 200,
          y: centerY + (Math.random() - 0.5) * 200,
        });

        const newNode = {
          id: createId(),
          type: selection.type,
          position: flowPosition,
          data: {},
        };

        if (hasInitialNode) {
          return [newNode];
        }

        return [...nodes, newNode];
      });
      onOpenChange(false);
    },
    [getNodes, setNodes, onOpenChange, screenToFlowPosition],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>What triggers this workflow?</SheetTitle>
          <SheetDescription>
            A trigger is a step that starts your workflow.
          </SheetDescription>
        </SheetHeader>
        {triggerNodes.map((nodeType) => {
          const Icon = nodeType.icon;
          return (
            // biome-ignore lint/a11y/noStaticElementInteractions: <explanation>
            // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
            <div
              key={nodeType.type}
              className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
              onClick={() => handleNodeSelect(nodeType)}
            >
              <div className="flex items-center gap-6 w-full overflow-hidden">
                {typeof Icon === "string" ? (
                  <Image
                    src={Icon}
                    alt={nodeType.label}
                    className="size-5 object-contain rounded-sm"
                  />
                ) : (
                  <Icon className="size-5" />
                )}
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium">{nodeType.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {nodeType.description}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <Separator />
        {executionNodes.map((nodeType) => {
          const Icon = nodeType.icon;
          return (
            // biome-ignore lint/a11y/noStaticElementInteractions: <explanation>
            // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
            <div
              key={nodeType.type}
              className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
              onClick={() => handleNodeSelect(nodeType)}
            >
              <div className="flex items-center gap-6 w-full overflow-hidden">
                {typeof Icon === "string" ? (
                  <Image
                    src={Icon}
                    alt={nodeType.label}
                    className="size-5 object-contain rounded-sm"
                  />
                ) : (
                  <Icon className="size-5" />
                )}
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium">{nodeType.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {nodeType.description}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </SheetContent>
    </Sheet>
  );
}
