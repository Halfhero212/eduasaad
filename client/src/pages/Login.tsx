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
import { useToast } from "@/hooks/use-toast";
import { GraduationCap } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const loginSchema = useMemo(() => z.object({
    email: z.string().email({ message: t('auth.invalid_email') }),
    password: z.string().min(1, { message: t('auth.password_required') }),
  }), [t]);

  type LoginForm = z.infer<typeof loginSchema>;

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
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
      await login(data.email, data.password);
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
                    <FormLabel>{t('auth.email')}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t('auth.email_placeholder')}
                        data-testid="input-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
