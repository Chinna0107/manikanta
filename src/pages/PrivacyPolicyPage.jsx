import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Link } from 'react-router-dom';

export function PrivacyPolicyPage() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen font-sans text-gray-800">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-500 mb-1">Effective Date: August 11, 2026</p>
        <p className="text-gray-500 mb-10">Last Updated: August 11, 2026</p>

        <div className="prose prose-sm md:prose-base prose-blue max-w-none text-gray-700 space-y-6">
          <p>
            Manikanta Super Market (“Manikanta Super Market,” “we,” “us,” or “our”) respects your privacy and is committed to protecting the personal information you provide when you visit or use our website, create an account, place an order, contact us, or otherwise interact with our products and services.
          </p>
          <p>
            This Privacy Policy explains what personal information we collect, how we collect and use it, when we share it, how we protect it, how long we retain it, and the choices and rights that may be available to you.
          </p>
          <p>
            Our website is intended for individuals 13 years of age or older. We do not knowingly permit individuals under 13 to create accounts or purchase products directly through our website.
          </p>
          <p>
            By using our website, you acknowledge this Privacy Policy. Where applicable law requires consent for a particular use of personal information, we will obtain the required consent.
          </p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">1. Who We Are</h2>
          <p>
            Manikanta Super Market is a U.S.-based jewelry business that sells fashion jewelry through its online store and other sales channels.
          </p>
          <p>
            For privacy-related questions or requests, please contact us using the information provided in the Contact Us section of this Privacy Policy.
          </p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">2. Age Requirement</h2>
          <p>Our website is intended for users who are 13 years of age or older.</p>
          <p>
            You must be at least 13 years old to create an Manikanta Super Market customer account or knowingly provide personal information to us through account registration.
          </p>
          <p>
            If you are under 13, please do not create an account, place an order, or provide personal information through our website.
          </p>
          <p>
            If we learn that we have collected personal information from an individual under 13 without the legally required parental consent, we will take reasonable steps to delete that information in accordance with applicable law.
          </p>
          <p>
            If you believe that an individual under 13 has provided personal information to us, please contact us using the information provided below.
          </p>
          
          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">Teen Users</h3>
          <p>
            Individuals between 13 and 17 years of age may use the website subject to our <Link to="/terms-of-service" className="text-brand-red underline font-semibold">Terms & Conditions</Link> and applicable law.
          </p>
          <p>
            We encourage parents and guardians to discuss online privacy and safe shopping practices with teenagers.
          </p>
          <p>
            We do not knowingly request information from teenagers that is unnecessary for operating their account, processing an order, providing customer support, or performing another disclosed business purpose.
          </p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">3. Personal Information We Collect</h2>
          <p>Depending on how you interact with Manikanta Super Market, we may collect the following categories of personal information.</p>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">A. Account Information</h3>
          <p>When you create an Manikanta Super Market account, we may collect:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>First and last name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Password or authentication information</li>
            <li>Account preferences</li>
            <li>Communication preferences</li>
            <li>Other information you voluntarily provide</li>
          </ul>
          <p>
            Your password should be kept confidential. We recommend that you do not reuse your Manikanta Super Market password on other websites.
          </p>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">B. Shipping and Billing Information</h3>
          <p>When you place an order, we may collect:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Customer name</li>
            <li>Shipping address</li>
            <li>Billing address</li>
            <li>Recipient name</li>
            <li>Phone number</li>
            <li>Delivery instructions</li>
            <li>Other information necessary to fulfill and deliver your order</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">C. Order and Purchase Information</h3>
          <p>We may collect information associated with your purchases, including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Order number</li>
            <li>Products purchased</li>
            <li>Product quantities</li>
            <li>Purchase date</li>
            <li>Order value</li>
            <li>Discounts or promotional codes used</li>
            <li>Shipping information</li>
            <li>Delivery status</li>
            <li>Returns</li>
            <li>Exchanges</li>
            <li>Refunds</li>
            <li>Order-related communications</li>
            <li>Customer order history</li>
          </ul>
          <p>Your order history may be associated with your customer account.</p>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">D. Payment Information</h3>
          <p>
            Payments may be processed through third-party payment processors. Depending on the payment method you select, the payment processor may collect payment information such as credit or debit card information.
          </p>
          <p>
            Manikanta Super Market does not intend to store complete payment card numbers or card security codes on its own servers. Payment information may instead be processed directly by our third-party payment providers according to their security practices and privacy policies.
          </p>
          <p>
            We may receive limited payment-related information, such as payment status, transaction identifiers, card type, or the last four digits of a payment card, where provided by our payment processor.
          </p>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">E. Customer Communications</h3>
          <p>When you contact us, we may collect information contained in your communication, including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Emails</li>
            <li>Customer service messages</li>
            <li>Product inquiries</li>
            <li>Order-related questions</li>
            <li>Return or refund requests</li>
            <li>Other information you voluntarily provide</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">F. Website and Device Information</h3>
          <p>When you visit our website, certain information may be collected automatically, including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>IP address</li>
            <li>Browser type</li>
            <li>Device type</li>
            <li>Operating system</li>
            <li>Approximate location based on IP address</li>
            <li>Pages visited</li>
            <li>Links or buttons interacted with</li>
            <li>Date and time of website visits</li>
            <li>Referring website</li>
            <li>Website activity and usage information</li>
            <li>Cookies and similar technology identifiers</li>
          </ul>
          <p>We use this information to operate, secure, analyze, and improve our website.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">4. How We Collect Personal Information</h2>
          <p>We may collect personal information:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Directly from you when you create an account</li>
            <li>When you place an order</li>
            <li>When you update your account</li>
            <li>When you contact customer support</li>
            <li>When you subscribe to marketing communications</li>
            <li>When you participate in promotions or events</li>
            <li>Automatically when you browse or interact with our website</li>
            <li>Through cookies and similar technologies</li>
            <li>From service providers that assist us with website operations, payments, shipping, analytics, security, marketing, and other business functions</li>
          </ul>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">5. How We Use Personal Information</h2>
          <p>We may use personal information for the following purposes.</p>
          
          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">Providing and Managing Our Services</h3>
          <p>We may use your information to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Create and manage your customer account</li>
            <li>Process orders</li>
            <li>Process payments</li>
            <li>Fulfill and ship purchases</li>
            <li>Provide delivery updates</li>
            <li>Maintain order history</li>
            <li>Process returns, exchanges, and refunds</li>
            <li>Provide customer support</li>
            <li>Respond to questions and requests</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">Website Operations</h3>
          <p>We may use information to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Operate our website</li>
            <li>Maintain website functionality</li>
            <li>Remember account and shopping preferences</li>
            <li>Improve website performance</li>
            <li>Troubleshoot technical issues</li>
            <li>Understand how customers use our website</li>
            <li>Personalize certain aspects of the shopping experience</li>
            <li>Maintain website security</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">Fraud and Security</h3>
          <p>We may use information to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Detect and prevent fraudulent transactions</li>
            <li>Protect customer accounts</li>
            <li>Detect unauthorized activity</li>
            <li>Protect our website and systems</li>
            <li>Investigate security incidents</li>
            <li>Prevent abuse or misuse of our services</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">Communications</h3>
          <p>We may use your information to send:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Account-related messages</li>
            <li>Order confirmations</li>
            <li>Order status updates</li>
            <li>Shipping notifications</li>
            <li>Delivery notifications</li>
            <li>Return or refund communications</li>
            <li>Customer service responses</li>
            <li>Other transactional communications</li>
          </ul>
          <p>Some transactional communications may be necessary to provide the services you requested and may not be treated as marketing communications.</p>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">Marketing</h3>
          <p>Where permitted by applicable law, we may use your information to send marketing communications regarding:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>New products</li>
            <li>New collections</li>
            <li>Special offers</li>
            <li>Promotions</li>
            <li>Sales</li>
            <li>Events</li>
            <li>Manikanta Super Market updates</li>
          </ul>
          <p>Where consent is required, we will obtain the appropriate consent.</p>
          <p>You can unsubscribe from marketing emails at any time by using the unsubscribe mechanism included in the communication or by contacting us.</p>
          <p>Unsubscribing from marketing communications will not prevent us from sending necessary transactional or service-related communications.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">6. Marketing Consent</h2>
          <p>Marketing communications are separate from your ability to create an account or place an order.</p>
          <p>Where applicable, we may provide a separate optional marketing checkbox during account registration, checkout, or another interaction.</p>
          <p>For example:</p>
          <blockquote className="border-l-4 border-brand-red/10 pl-4 py-2 italic text-gray-600 bg-gray-50 rounded-r">
            “Yes, I would like to receive emails from Manikanta Super Market about new products, promotions, special offers, and updates. I understand that I can unsubscribe at any time.”
          </blockquote>
          <p>Marketing consent is not required to purchase products from Manikanta Super Market.</p>
          <p>You may withdraw marketing consent at any time.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">7. Cookies and Similar Technologies</h2>
          <p>We may use cookies, pixels, tags, scripts, local storage, and similar technologies.</p>
          <p>These technologies may help us:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Keep you signed in</li>
            <li>Maintain your shopping cart</li>
            <li>Remember preferences</li>
            <li>Understand website usage</li>
            <li>Improve website functionality</li>
            <li>Maintain website security</li>
            <li>Measure website performance</li>
            <li>Understand marketing campaign performance</li>
            <li>Provide or measure advertising, where applicable</li>
          </ul>
          <p>Some cookies may be necessary for the website to function.</p>
          <p>Other cookies may be used for analytics, personalization, advertising, or other purposes depending on the tools implemented on our website.</p>
          <p>You may be able to control certain cookies through your browser or device settings.</p>
          <p>Where required by applicable law, we will provide additional cookie choices or consent mechanisms.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">8. How We Share Personal Information</h2>
          <p>We do not sell personal information as a source of revenue.</p>
          <p>We may, however, disclose or make personal information available to third parties when reasonably necessary to operate our business, provide our services, or fulfill the purposes described in this Privacy Policy.</p>
          <p>These third parties may include:</p>
          
          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">Payment Providers</h3>
          <p>Payment processors may process payment information to authorize and complete transactions.</p>
          
          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">Shipping and Delivery Providers</h3>
          <p>We may provide shipping and delivery companies with information necessary to fulfill and deliver your order, such as:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Name</li>
            <li>Shipping address</li>
            <li>Phone number</li>
            <li>Order information</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">Website and Technology Providers</h3>
          <p>We may use third-party providers for:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Website hosting</li>
            <li>E-commerce services</li>
            <li>Cloud infrastructure</li>
            <li>Database services</li>
            <li>Security</li>
            <li>Fraud prevention</li>
            <li>Customer support</li>
            <li>Email delivery</li>
            <li>Analytics</li>
            <li>Website performance</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">Marketing and Advertising Providers</h3>
          <p>Where applicable, we may use third-party services for:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Email marketing</li>
            <li>Marketing campaign management</li>
            <li>Advertising</li>
            <li>Conversion measurement</li>
            <li>Analytics</li>
            <li>Retargeting</li>
          </ul>
          <p>Some of these providers may use cookies, pixels, or similar technologies.</p>
          <p>The actual providers used by Manikanta Super Market may change over time.</p>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">Professional and Business Service Providers</h3>
          <p>We may share information with service providers such as accountants, attorneys, consultants, auditors, insurers, and other professionals where reasonably necessary for our business operations.</p>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">Legal and Safety Purposes</h3>
          <p>We may disclose personal information when reasonably necessary to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Comply with applicable law</li>
            <li>Respond to valid legal processes</li>
            <li>Respond to government requests</li>
            <li>Protect our legal rights</li>
            <li>Protect our customers or others</li>
            <li>Investigate fraud</li>
            <li>Investigate security incidents</li>
            <li>Enforce our agreements</li>
            <li>Prevent illegal activity</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">Business Transactions</h3>
          <p>If Manikanta Super Market is involved in a merger, acquisition, financing, restructuring, sale of assets, sale of the business, bankruptcy, or similar transaction, personal information may be transferred as part of that transaction, subject to applicable law.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">9. Third-Party Service Providers</h2>
          <p>Third-party companies that provide services to Manikanta Super Market may process personal information on our behalf or independently according to their own privacy practices.</p>
          <p>Examples may include payment processors, shipping providers, website hosting providers, analytics providers, email providers, security providers, and advertising providers.</p>
          <p>These companies may have their own privacy policies.</p>
          <p>We encourage you to review the privacy policies of third-party services you interact with.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">10. Order History and Customer Accounts</h2>
          <p>If you create an Manikanta Super Market account, we may maintain information associated with your account, including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Account details</li>
            <li>Saved addresses</li>
            <li>Orders</li>
            <li>Purchases</li>
            <li>Returns</li>
            <li>Refunds</li>
            <li>Exchanges</li>
            <li>Customer service interactions</li>
            <li>Communication preferences</li>
          </ul>
          <p>This information allows you to view your order history and helps us provide customer service and manage transactions.</p>
          <p>You may request deletion of your account or certain personal information, subject to applicable legal and business recordkeeping requirements.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">11. Data Security</h2>
          <p>We use reasonable administrative, technical, and organizational safeguards designed to protect personal information against unauthorized access, use, disclosure, alteration, or destruction.</p>
          <p>These measures may include appropriate access controls, security monitoring, encryption or secure transmission technologies where appropriate, and security practices provided by our third-party service providers.</p>
          <p>However, no website, internet transmission, electronic storage system, or security measure can be guaranteed to be completely secure.</p>
          <p>Therefore, while we take reasonable steps to protect your information, we cannot guarantee absolute security.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">12. Data Retention</h2>
          <p>We retain personal information only for as long as reasonably necessary for the purposes described in this Privacy Policy, including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Providing services</li>
            <li>Managing customer accounts</li>
            <li>Processing transactions</li>
            <li>Maintaining order records</li>
            <li>Providing customer support</li>
            <li>Preventing fraud</li>
            <li>Resolving disputes</li>
            <li>Enforcing agreements</li>
            <li>Complying with tax, accounting, legal, and regulatory requirements</li>
          </ul>
          <p>Different categories of information may be retained for different periods.</p>
          <p>When information is no longer reasonably necessary, we may delete, anonymize, or securely dispose of it, subject to applicable legal and business requirements.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">13. Children's and Teen Privacy</h2>
          <p>Manikanta Super Market is a 13+ general-audience website and is not directed toward children under 13.</p>
          <p>We do not knowingly collect personal information from children under 13 through account registration or knowingly permit children under 13 to create accounts.</p>
          <p>If we learn that we have collected personal information from a child under 13 in circumstances where parental consent was legally required, we will take reasonable steps to delete the information as required by applicable law.</p>
          <p>If a parent or guardian believes that a child under 13 has provided personal information to Manikanta Super Market, they may contact us using the information in the “Contact Us” section.</p>
          <p>For users between 13 and 17, we may collect information necessary to provide account, shopping, payment, shipping, customer support, and other disclosed services.</p>
          <p>We do not knowingly use a teenager's information for purposes that are prohibited by applicable law.</p>
          <p>Where applicable law provides additional privacy rights or protections for minors, we will honor those requirements.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">14. Your Privacy Rights</h2>
          <p>Depending on where you live and which privacy laws apply to you, you may have certain rights concerning your personal information.</p>
          <p>These rights may include:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Right to know what personal information we collect</li>
            <li>Right to access personal information</li>
            <li>Right to request correction of inaccurate information</li>
            <li>Right to request deletion of personal information</li>
            <li>Right to obtain a copy of certain personal information</li>
            <li>Right to opt out of certain processing activities</li>
            <li>Right to opt out of certain targeted advertising</li>
            <li>Right to opt out of certain sale or sharing of personal information where applicable</li>
            <li>Right to withdraw consent where processing is based on consent</li>
            <li>Right to appeal certain privacy-request decisions</li>
            <li>Right to receive equal treatment for exercising applicable privacy rights</li>
          </ul>
          <p>The availability and scope of these rights depend on applicable law.</p>
          <p>Certain exceptions may apply. For example, we may be permitted or required to retain certain information to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Complete a transaction</li>
            <li>Provide a service</li>
            <li>Maintain required business records</li>
            <li>Comply with legal obligations</li>
            <li>Detect or prevent fraud</li>
            <li>Protect security</li>
            <li>Resolve disputes</li>
            <li>Establish or defend legal claims</li>
          </ul>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">15. How to Submit a Privacy Request</h2>
          <p>If you would like to exercise an applicable privacy right, please contact us using the information provided in the “Contact Us” section.</p>
          <p>Your request should provide enough information for us to understand what you are requesting.</p>
          <p>For security purposes, we may need to verify your identity before completing certain requests.</p>
          <p>We will process applicable privacy requests according to the requirements and timelines of the laws that apply to the request.</p>
          <p>If applicable law provides a right to appeal our decision, you may contact us to request an appeal.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">18. International Visitors</h2>
          <p>Manikanta Super Market is based in the United States.</p>
          <p>If you access our website from outside the United States, your personal information may be processed or stored in the United States or other countries where our service providers operate.</p>
          <p>Privacy laws in those locations may differ from the laws in your country.</p>
          <p>By using our website, you understand that your information may be transferred to and processed in the United States, subject to applicable law.</p>
          <p>Where required by applicable law, we will implement appropriate safeguards for international transfers.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">19. Third-Party Websites and Social Media</h2>
          <p>Our website may contain links to third-party websites, applications, social media platforms, payment services, shipping services, or other third-party services.</p>
          <p>Manikanta Super Market does not control the privacy practices of third-party websites or services.</p>
          <p>If you leave our website or interact with a third-party service, that third party's privacy policy may apply.</p>
          <p>We encourage you to review the privacy policies of third parties before providing personal information.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">20. Social Media Interactions</h2>
          <p>If you interact with Manikanta Super Market through social media platforms, those platforms may collect information about you according to their own privacy policies.</p>
          <p>If you voluntarily post, comment, tag, message, or otherwise interact with Manikanta Super Market publicly, information you provide may be visible to others depending on the platform and your account settings.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">21. Promotional Events and Customer Content</h2>
          <p>From time to time, Manikanta Super Market may conduct promotions, giveaways, events, or customer-content campaigns.</p>
          <p>If you voluntarily submit information, photographs, reviews, testimonials, or other content, we may use that information according to the terms disclosed when you submit it and applicable law.</p>
          <p>Where separate permission is required to use your name, image, testimonial, photograph, or other content for promotional purposes, we will obtain the appropriate permission.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">22. Account Deletion</h2>
          <p>You may request that your Manikanta Super Market account be deleted by contacting us.</p>
          <p>When an account deletion request is received, we may delete or deactivate information associated with the account, subject to applicable law and legitimate business requirements.</p>
          <p>Deleting an account may not result in immediate deletion of every record.</p>
          <p>For example, we may retain certain transactions, tax, accounting, fraud-prevention, dispute, or legal records when required or reasonably necessary.</p>
          <p>Where information must be retained, we will limit its use to the purposes for which retention is required or permitted.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">23. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time.</p>
          <p>Changes may be made because of:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Changes to our business</li>
            <li>New products or services</li>
            <li>Changes to our website</li>
            <li>Changes to technology</li>
            <li>Changes to third-party service providers</li>
            <li>Changes to applicable laws</li>
            <li>Changes to our privacy practices</li>
          </ul>
          <p>When we update this Privacy Policy, we will update the “Last Updated” date at the top.</p>
          <p>If we make a material change and applicable law requires additional notice, we may provide notice through our website, email, account notification, or another appropriate method.</p>
          <p>We encourage you to periodically review this Privacy Policy.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">24. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, want to exercise an applicable privacy right, or believe that personal information has been collected from a child under 13, please contact us:</p>
          <ul className="list-none pl-0 space-y-2 font-medium">
            <li><strong>Manikanta Super Market</strong></li>
            <li>Privacy Email: <a href="mailto:mani.worriers@gmail.com" className="text-brand-red underline">mani.worriers@gmail.com</a></li>
            <li>Website: <a href="https://manikantasupermarket.com" target="_blank" rel="noopener noreferrer" className="text-brand-red underline">https://manikantasupermarket.com</a></li>
            <li>Business Address: Aspari main road opposite APGB Bank, 518347</li>
          </ul>
          <p className="text-sm text-gray-600 mt-2">When contacting us regarding a privacy request, please provide enough information for us to identify and process your request.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">25. Your Acknowledgment</h2>
          <p>By using the Manikanta Super Market website, you acknowledge that you have had an opportunity to review this Privacy Policy.</p>
          <p>Where a separate consent is legally required for a particular processing activity, Manikanta Super Market will obtain that consent separately.</p>
          <p>This Privacy Policy does not replace the Manikanta Super Market <Link to="/terms-of-service" className="text-brand-red underline font-semibold">Terms & Conditions</Link>.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
