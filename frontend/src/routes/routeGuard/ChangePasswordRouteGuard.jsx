import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { useUserStore } from "@/stores/userStore";

export function ChangePasswordRouteGuard() {
    const userProfile = useUserStore(
        (state) => state.userProfile
    );

    const hasLocalAuth =
        userProfile?.providers?.local?.enabled;

    useEffect(() => {
        if (!hasLocalAuth) {
            toast.warning("OMG brooooo fr, can't you even set a password? And don't even try to access this page again.", {
                id: "set-password-required",// to prevent duplicate toasts if user navigates back and forth
                duration: 5000,
            });
        }
    }, [hasLocalAuth]);

    return hasLocalAuth ? (
        <Outlet />
    ) : (
        <Navigate
            to="/settings/account/set-password"
            replace
        />
    );
}