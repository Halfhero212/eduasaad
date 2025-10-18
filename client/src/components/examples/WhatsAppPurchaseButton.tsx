import { WhatsAppPurchaseButton } from '../WhatsAppPurchaseButton';
import { Card, CardContent } from '@/components/ui/card';

export default function WhatsAppPurchaseButtonExample() {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Advanced JavaScript Programming</h3>
          <WhatsAppPurchaseButton
            courseName="Advanced JavaScript Programming"
            price={49}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Web Development Bootcamp</h3>
          <WhatsAppPurchaseButton
            courseName="Web Development Bootcamp"
            price={99}
            variant="outline"
          />
        </CardContent>
      </Card>
    </div>
  );
}
