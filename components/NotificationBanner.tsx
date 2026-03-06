export type NotificationType = "success" | "info" | "warning" | "error";

export type NotificationState = {
  message: string;
  type: NotificationType;
};

type NotificationBannerProps = {
  notification: NotificationState;
  className?: string;
};

export default function NotificationBanner({
  notification,
  className,
}: NotificationBannerProps) {
  return (
    <p
      className={`notification-banner notification-${notification.type}${className ? ` ${className}` : ""}`}
      role="status"
      aria-live="polite"
    >
      {notification.message}
    </p>
  );
}
