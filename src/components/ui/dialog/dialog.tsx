import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import "./dialog.scss"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentProps<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    data-slot="dialog-overlay"
    className={cn(
      "fixed inset-0 z-50 bg-black/50",
      "dialog-overlay data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

interface DialogContentProps extends React.ComponentProps<typeof DialogPrimitive.Content> {
  showCloseButton?: boolean;
  width?: string;
  fullWidth?: boolean;
  fullScreen?: boolean;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, showCloseButton = true, width, fullWidth = false, fullScreen = false, ...props }, ref) => {
  const inlineStyles: React.CSSProperties = !!width && !fullWidth && !fullScreen ? { width } : {};

  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay className="z-[40000]" />
      <DialogPrimitive.Content
        ref={ref}
        data-slot="dialog-content"
        aria-describedby={undefined}
        className={cn(
          "fixed top-[50%] left-[50%] z-[40001] w-full translate-x-[-50%] translate-y-[-50%] rounded-lg border shadow-lg duration-200",
          "dialog-content data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          fullWidth && "full-width",
          fullScreen && "full-screen",
          className
        )}
        style={inlineStyles}
        {...props}
      >
        <div className="dialog-inner">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === DialogHeader) {
              return React.cloneElement(child as React.ReactElement<any>, {
                showCloseButton,
              });
            }
            return child;
          })}
        </div>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
});
DialogContent.displayName = "DialogContent";

interface DialogHeaderProps extends React.ComponentProps<"div"> {
  showCloseButton?: boolean;
}

function DialogHeader({ className, showCloseButton, ...props }: DialogHeaderProps) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("dialog-header", className)}
      {...props}
    >
      {props.children}
      {showCloseButton && (
        <DialogPrimitive.Close
          data-slot="dialog-close"
          className="dialog-close-btn"
        >
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("dialog-footer", className)}
      {...props}
    />
  )
}

function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-body"
      className={cn("dialog-body", className)}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("dialog-title", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("dialog-description", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  DialogBody,
}
