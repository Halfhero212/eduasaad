import { useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const formSchema = useMemo(() => z.object({
    password: z.string().min(6, t("validation.password_min")),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("validation.password_mismatch"),
    path: ["confirmPassword"],
  }), [t]);

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!token) {
        throw new Error("No reset token provided");
      }
      const response = await apiRequest("POST", "/api/auth/reset-password", {
        token,
        password: data.password,
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: t("toast.password_reset_success"),
        description: t("toast.password_reset_success_desc"),
      });
      setTimeout(() => {
        setLocation("/login");
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: t("toast.password_reset_failed"),
        description: error.message || t("toast.password_reset_failed_desc"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    resetPasswordMutation.mutate(data);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t("auth.invalid_reset_link")}</CardTitle>
            <CardDescription>{t("auth.invalid_reset_link_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/request-reset">
              <Button className="w-full" data-testid="button-request-new-link">
                {t("action.request_new_link")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (resetPasswordMutation.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              {t("auth.password_reset_success")}
            </CardTitle>
            <CardDescription>{t("auth.password_reset_success_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full" data-testid="button-go-to-login">
                {t("action.go_to_login")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("auth.reset_password")}</CardTitle>
          <CardDescription>{t("auth.enter_new_password")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("label.new_password")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t("placeholder.password")}
                        data-testid="input-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("label.confirm_password")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t("placeholder.confirm_password")}
                        data-testid="input-confirm-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={resetPasswordMutation.isPending}
                data-testid="button-reset-password"
              >
                {resetPasswordMutation.isPending ? t("action.resetting") : t("action.reset_password")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
