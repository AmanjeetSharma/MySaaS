import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useCustomerStore } from "@/stores";

const CustomerEditDialog = ({
    open,
    onOpenChange,
    customer,
}) => {
    const {
        updateCustomer,
        isUpdating,
    } = useCustomerStore();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        if (!customer) return;

        setFormData({
            name: customer.name || "",
            email: customer.email || "",
            phone: customer.phone || "",
        });
    }, [customer]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!customer?._id) return;

        try {
            await updateCustomer(
                customer._id,
                {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim(),
                }
            );

            onOpenChange(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleClose = () => {
        if (isUpdating) return;

        onOpenChange(false);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={handleClose}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        Edit Customer
                    </DialogTitle>

                    <DialogDescription>
                        Update customer information.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Name
                        </Label>

                        <Input
                            id="name"
                            placeholder="Customer name"
                            value={formData.name}
                            onChange={(e) =>
                                handleChange(
                                    "name",
                                    e.target.value
                                )
                            }
                            disabled={isUpdating}
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">
                            Email
                        </Label>

                        <Input
                            id="email"
                            type="email"
                            placeholder="customer@email.com"
                            value={formData.email}
                            onChange={(e) =>
                                handleChange(
                                    "email",
                                    e.target.value
                                )
                            }
                            disabled={isUpdating}
                        />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">
                            Phone
                        </Label>

                        <Input
                            id="phone"
                            placeholder="9999999999"
                            value={formData.phone}
                            onChange={(e) =>
                                handleChange(
                                    "phone",
                                    e.target.value
                                )
                            }
                            disabled={isUpdating}
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isUpdating}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={
                                isUpdating ||
                                !formData.name.trim()
                            }
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CustomerEditDialog;