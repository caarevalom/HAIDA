import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Info } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

export const InfoDrawer = () => {
  const { t } = useSettings();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-500/10 border border-slate-500/20 text-muted-foreground text-xs font-medium hover:text-foreground hover:border-blue-600/30 transition-all backdrop-blur-xl shadow-lg">
          <Info size={14} />
          <span className="hidden sm:inline">
            {t.drawer.button}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-background border-border text-foreground sm:max-w-sm rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-2 text-foreground">
            {t.drawer.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t.drawer.desc}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-600">
              {t.drawer.brandMode}
            </h4>
            <p className="text-sm text-muted-foreground">
              {t.drawer.brandModeDesc}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-cyan-500">
              {t.drawer.interactive}
            </h4>
            <p className="text-sm text-muted-foreground">
              {t.drawer.interactiveDesc}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-green-600">
              {t.drawer.miniapps}
            </h4>
            <p className="text-sm text-muted-foreground">
              {t.drawer.miniappsDesc}
            </p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outline"
              className="w-full bg-transparent border-border text-foreground hover:bg-secondary hover:text-foreground"
            >
              {t.drawer.close}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};