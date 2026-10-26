import { site } from "../config/site"

export const legal = {
  privacy: {
    en: {
      title: "Privacy policy",
      paragraphs: [
        "This is a browser-local demonstration. Cart, preferences, mock account credentials, orders and submitted forms are saved on this device, not sent to a restaurant.",
        "Do not enter real passwords or sensitive personal information. Browser storage is not a secure identity service. Clear this site's browser data to remove your demo records.",
        `Questions about this template can be directed to ${site.email}. Replace this policy with reviewed business content before launch.`,
      ],
    },
    ar: {
      title: "سياسة الخصوصية",
      paragraphs: [
        "هذا عرض محلي في المتصفح. تحفظ السلة والتفضيلات والحسابات والطلبات والنماذج التجريبية على هذا الجهاز ولا ترسل إلى مطعم.",
        "لا تدخل كلمات مرور حقيقية أو معلومات حساسة. تخزين المتصفح ليس خدمة هوية آمنة. امسح بيانات هذا الموقع لحذف السجلات التجريبية.",
        `للاستفسار عن القالب تواصل عبر ${site.email}. استبدل هذه السياسة بمحتوى قانوني مراجع قبل الإطلاق.`,
      ],
    },
  },
  terms: {
    en: {
      title: "Terms of service",
      paragraphs: [
        "This website demonstrates restaurant browsing, ordering and reservation flows. No payment is collected and no real order or booking is accepted.",
        "Prices, branch information, availability, offers and customer feedback are sample content. Browser-local confirmations are demonstrations, not contracts with a restaurant.",
        `For questions contact ${site.email}. A production business must supply its own ordering, cancellation, refund and delivery terms.`,
      ],
    },
    ar: {
      title: "شروط الخدمة",
      paragraphs: [
        "يعرض هذا الموقع تجربة تصفح مطعم والطلب والحجز. لا يتم تحصيل دفعات أو قبول طلبات أو حجوزات حقيقية.",
        "الأسعار والفروع والتوفر والعروض والتقييمات محتوى تجريبي. التأكيدات المحلية ليست عقوداً مع مطعم.",
        `للاستفسار تواصل عبر ${site.email}. يجب توفير شروط الطلب والإلغاء والاسترداد والتوصيل الخاصة بالنشاط قبل الإطلاق.`,
      ],
    },
  },
}
