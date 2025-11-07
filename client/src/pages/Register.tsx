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

export default function Register() {
  const [, setLocation] = useLocation();
  const { register: registerUser, isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const registerSchema = useMemo(() => z.object({
    fullName: z.string().min(2, { message: t('auth.fullname_min_length') }),
    email: z.string().email({ message: t('auth.invalid_email') }),
    whatsappNumber: z.string().min(10, { message: t('auth.phone_min_length') }),
    password: z.string().min(6, { message: t('auth.password_min_length') }),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('auth.passwords_must_match'),
    path: ["confirmPassword"],
  }), [t]);

  type RegisterForm = z.infer<typeof registerSchema>;

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      whatsappNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      setLocation("/dashboard/student");
    }
  }, [isLoading, isAuthenticated, user, setLocation]);

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data.fullName, data.email, data.whatsappNumber, data.password);
      toast({
        title: t('toast.register_success'),
        description: `${t('toast.register_success_desc')} ${t('app.name')}!`,
      });
    } catch (error) {
      // Check if error has a translation code
      const errorCode = error && typeof error === 'object' && 'code' in error ? (error as any).code : null;
      const errorMessage = errorCode ? t(errorCode) : (error instanceof Error ? error.message : t('toast.register_failed_desc'));
      
      toast({
        title: t('toast.register_failed'),
        description: errorMessage,
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
          <CardTitle className="text-2xl">{t('auth.create_account')}</CardTitle>
          <CardDescription>
            {t('register.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.full_name')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('auth.fullname_placeholder')}
                        data-testid="input-fullname"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                name="whatsappNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.whatsapp_number')}</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder={t('auth.whatsapp_placeholder')}
                        data-testid="input-whatsapp"
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.confirm_password')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t('auth.confirm_password_placeholder')}
                        data-testid="input-confirmpassword"
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
                data-testid="button-register"
              >
                {form.formState.isSubmitting ? t('register.creating_account') : t('auth.create_account')}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-sm text-muted-foreground text-center">
            {t('auth.have_account')}{" "}
            <Link href="/login" data-testid="link-login">
              <span className="text-primary hover:underline cursor-pointer">
                {t('auth.sign_in')}
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
