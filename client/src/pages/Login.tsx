import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap } from "lucide-react";

const countryOptions = [
  { value: "+964", label: "العراق (+964)" },
  { value: "+971", label: "الإمارات (+971)" },
  { value: "+966", label: "السعودية (+966)" },
  { value: "+962", label: "الأردن (+962)" },
  { value: "+1", label: "USA (+1)" },
];

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const loginSchema = useMemo(
    () =>
      z
        .object({
          email: z.string().email({ message: t("auth.invalid_email") }).optional().or(z.literal("")),
          phone: z.string().optional(),
          countryCode: z.string().min(1),
          password: z.string().min(1, { message: t("auth.password_required") }),
        })
        .refine((data) => {
          const hasEmail = !!data.email?.trim();
          const hasPhone = !!data.phone?.trim();
          return hasEmail || hasPhone;
        }, { message: t("auth.identifier_required"), path: ["email"] }),
    [t],
  );

  type LoginForm = z.infer<typeof loginSchema>;

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onChange", // Validate instantly as user types
    defaultValues: {
      email: "",
      phone: "",
      countryCode: countryOptions[0].value,
      password: "",
    },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === "superadmin") {
        setLocation("/dashboard/superadmin");
      } else if (user.role === "teacher") {
        setLocation("/dashboard/teacher");
      } else {
        setLocation("/dashboard/student");
      }
    }
  }, [isLoading, isAuthenticated, user, setLocation]);

  const onSubmit = async (data: LoginForm) => {
    try {
      let finalIdentifier = data.email?.trim() || "";
      if (!finalIdentifier) {
        const raw = data.phone?.trim() || "";
        const digitsOnly = raw.replace(/\D/g, "");
        if (!digitsOnly) {
          throw new Error(t("auth.identifier_required"));
        }
        const withoutLeadingZero = digitsOnly.replace(/^0+/, "") || digitsOnly;
        const code = data.countryCode || countryOptions[0].value;
        finalIdentifier = `${code}${withoutLeadingZero}`;
      }

      await login(finalIdentifier, data.password);
      toast({
        title: t('toast.login_success'),
        description: t('toast.login_success_desc'),
      });
    } catch (error) {
      toast({
        title: t('toast.login_failed'),
        description: error instanceof Error ? error.message : t('toast.login_failed_desc'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">{t('auth.welcome_back')}</CardTitle>
          <CardDescription>
            {t('auth.enter_credentials')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.email")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="username"
                        data-testid="input-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>{t("auth.phone_only")}</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          autoComplete="tel"
                          data-testid="input-phone"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="countryCode"
                  render={({ field: countryField }) => (
                    <FormItem className="w-40">
                      <FormLabel>{t("auth.country_code")}</FormLabel>
                      <Select onValueChange={countryField.onChange} defaultValue={countryField.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.password')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t('auth.password_placeholder')}
                        data-testid="input-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="text-xs text-muted-foreground mt-2">
                      {t('auth.forgot_password_contact')}{" "}
                      <a
                        href="https://wa.me/9647730145334"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                        data-testid="link-whatsapp-support"
                      >
                        +964 773 014 5334
                      </a>
                    </div>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
                data-testid="button-login"
              >
                {form.formState.isSubmitting ? t('auth.signing_in') : t('auth.sign_in')}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-sm text-muted-foreground text-center">
            {t('auth.no_account')}{" "}
            <Link href="/register" data-testid="link-register">
              <span className="text-primary hover:underline cursor-pointer">
                {t('auth.create_account')}
              </span>
            </Link>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            <Link href="/" data-testid="link-home">
              <span className="text-primary hover:underline cursor-pointer">
                {t('auth.back_to_home')}
              </span>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
