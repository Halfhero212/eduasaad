import { useState, useMemo } from "react";
import { Link } from "wouter";
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
import { ArrowLeft, Mail } from "lucide-react";

export default function RequestPasswordReset() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [emailSent, setEmailSent] = useState(false);

  const formSchema = useMemo(() => z.object({
    email: z.string().email(t("validation.email_invalid")),
  }), [t]);

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const requestResetMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/auth/request-reset", data);
      return response;
    },
    onSuccess: () => {
      setEmailSent(true);
      toast({
        title: t("toast.reset_request_sent"),
        description: t("toast.reset_request_sent_desc"),
      });
    },
    onError: () => {
      toast({
        title: t("toast.reset_request_failed"),
        description: t("toast.reset_request_failed_desc"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    requestResetMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/login">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <CardTitle>{t("auth.reset_password")}</CardTitle>
          </div>
          <CardDescription>
            {emailSent 
              ? t("auth.reset_email_sent_desc")
              : t("auth.reset_password_desc")
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                <Mail className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {t("auth.check_email_instructions")}
              </p>
              <Link href="/login">
                <Button className="w-full" data-testid="button-back-to-login">
                  {t("action.back_to_login")}
                </Button>
              </Link>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("label.email")}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t("placeholder.email")}
                          data-testid="input-email"
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
                  disabled={requestResetMutation.isPending}
                  data-testid="button-request-reset"
                >
                  {requestResetMutation.isPending ? t("action.sending") : t("action.send_reset_link")}
                </Button>

                <div className="text-center">
                  <Link href="/login">
                    <Button variant="ghost" data-testid="link-back-to-login">
                      {t("action.back_to_login")}
                    </Button>
                  </Link>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
