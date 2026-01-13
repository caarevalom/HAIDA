import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { HelpCircle, Command, MousePointerClick, Zap } from "lucide-react";
import { Button } from "../ui/button";

export const UsageGuide = ({ trigger }: { trigger?: React.ReactNode }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-stayarta-teal/10 hover:text-stayarta-teal">
            <HelpCircle size={20} />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-background/95 backdrop-blur-xl border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <HelpCircle className="text-stayarta-teal" size={20} />
            System Manual
          </DialogTitle>
          <DialogDescription>
            Operational guide for the Nova Interface.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-stayarta-teal/10 flex items-center justify-center shrink-0 border border-stayarta-teal/20 text-stayarta-teal">
              <Command size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Command Surface</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The central grid acts as a command palette. Tap any tile to initiate the corresponding Telegram bot action or copy the command to clipboard.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-stayarta-orange/10 flex items-center justify-center shrink-0 border border-stayarta-orange/20 text-stayarta-orange">
              <Zap size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Live Cards</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Dynamic status indicators for Nova AI, Operations, and Mini Apps. These modules provide real-time visual feedback on system health.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-stayarta-yellow/10 flex items-center justify-center shrink-0 border border-stayarta-yellow/20 text-stayarta-yellow">
              <MousePointerClick size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Interaction</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                • <strong>Single Tap:</strong> Execute/Select<br/>
                • <strong>Long Press:</strong> View details (Mobile)<br/>
                • <strong>Hover:</strong> Reveal status (Desktop)
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
            StayArta Systems v2.4.0
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
