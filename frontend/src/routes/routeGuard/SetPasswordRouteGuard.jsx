import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { useUserStore } from "@/stores/userStore";

export function SetPasswordRouteGuard() {
    const userProfile = useUserStore(
        (state) => state.userProfile
    );

    const hasLocalAuth =
        userProfile?.providers?.local?.enabled;

    useEffect(() => {
        if (hasLocalAuth) {
            toast.info("Your account already has a password configured.", {
                id: "password-already-exists",
                duration: 5000,
            });
        }
    }, [hasLocalAuth]);

    return !hasLocalAuth ? (
        <Outlet />
    ) : (
        <Navigate
            to="/settings/account/change-password"
            replace
        />
    );
}