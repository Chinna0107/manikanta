import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function TermsOfServicePage() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen font-sans text-gray-800">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-4">Terms & Conditions</h1>
        <p className="text-gray-500 mb-1">Effective Date: August 11, 2026</p>
        <p className="text-gray-500 mb-10">Last Updated: August 11, 2026</p>

        <div className="prose prose-sm md:prose-base prose-blue max-w-none text-gray-700 space-y-6">
          <p>Welcome to Manikanta Super Market.</p>
          <p>These Terms & Conditions (“Terms,” “Terms & Conditions”) govern your access to and use of the Manikanta Super Market website, including browsing the website, creating an account, placing orders, purchasing products, and using other services provided through our website.</p>
          <p>By accessing or using the website, creating an account, or placing an order, you agree to be bound by these Terms & Conditions and our Privacy Policy.</p>
          <p>If you do not agree with these Terms, please do not use our website or place an order.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">1. About Manikanta Super Market</h2>
          <p>Manikanta Super Market (“Manikanta Super Market,” “we,” “us,” or “our”) operates an online jewelry business offering fashion jewelry and related products.</p>
          <p>These Terms apply to all purchases and transactions made through our website unless otherwise stated.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">2. Eligibility</h2>
          <p>Our website is intended for individuals 13 years of age or older.</p>
          <p>By creating an account or placing an order, you confirm that you are at least 13 years old and have the legal capacity to enter into these Terms.</p>
          <p>If you are under 13 years of age, you may not create an account or knowingly provide personal information through our website.</p>
          <p>If you are between 13 and 17 years old, you should use the website with the involvement and guidance of a parent or legal guardian where appropriate.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">3. Account Registration</h2>
          <p>Certain features of our website may require you to create an account. When creating an account, you agree to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide accurate and current information</li>
            <li>Maintain the accuracy of your information</li>
            <li>Keep your account credentials confidential</li>
            <li>Not share your password with others</li>
            <li>Notify us if you believe your account has been accessed without authorization</li>
            <li>Be responsible for activity occurring through your account</li>
          </ul>
          <p>We reserve the right to suspend or terminate accounts that contain inaccurate information, violate these Terms, or are involved in fraudulent, abusive, or unauthorized activity.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">4. Product Information</h2>
          <p>We make reasonable efforts to display product descriptions, photographs, colors, sizes, materials, and other product information as accurately as possible. However:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Colors may appear different depending on your device or screen settings.</li>
            <li>Product photographs may not perfectly represent the actual color, finish, size, or appearance.</li>
            <li>Minor variations may occur between individual products.</li>
            <li>Product dimensions and specifications may be subject to reasonable manufacturing variations.</li>
          </ul>
          <p>We do not guarantee that product images displayed on your device will exactly match the physical product.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">5. Product Availability</h2>
          <p>All products are subject to availability. We reserve the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Limit quantities</li>
            <li>Discontinue products</li>
            <li>Modify product designs or specifications</li>
            <li>Correct product information</li>
            <li>Cancel orders when necessary</li>
          </ul>
          <p>If a product becomes unavailable after you place an order, we may cancel the affected portion of the order and issue an applicable refund to the original payment method.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">6. Pricing and Taxes</h2>
          <p>Prices displayed on the website are subject to change without notice. We make reasonable efforts to ensure that product prices are accurate. However, errors may occasionally occur.</p>
          <p>If we discover an obvious pricing or listing error, we reserve the right to correct the error and, where appropriate, cancel an affected order.</p>
          <p>Applicable sales tax and any other required charges may be applied to your order in accordance with Manikanta Super Market location or the shipping destination and applicable law.</p>
          <p>The final amount payable will be displayed during checkout before you complete your purchase.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">7. Orders</h2>
          <p>Placing an order through our website constitutes an offer to purchase the selected products. After placing an order, you may receive an order confirmation email. An order confirmation does not necessarily mean that Manikanta Super Market has accepted the order.</p>
          <p>We reserve the right to accept, reject, limit, or cancel an order for reasons including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Product availability</li>
            <li>Pricing or listing errors</li>
            <li>Suspected fraud</li>
            <li>Unauthorized transactions</li>
            <li>Incorrect customer information</li>
            <li>Shipping limitations</li>
            <li>Duplicate orders</li>
            <li>Violation of these Terms</li>
            <li>Other legitimate business reasons</li>
          </ul>
          <p>If we cancel an order after payment has been processed, we will issue an applicable refund to the original payment method.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">8. Payment</h2>
          <p>We accept payment methods displayed during checkout. Payment may be processed through third-party payment processors.</p>
          <p>By submitting payment information, you represent that:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>You are authorized to use the payment method.</li>
            <li>The information provided is accurate.</li>
            <li>The transaction is authorized by you.</li>
            <li>You will not use another person's payment method without authorization.</li>
          </ul>
          <p>Your payment information may be processed directly by our third-party payment provider. Manikanta Super Market does not intend to store complete credit card numbers or card security codes on its own servers.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">9. Credit Card and Payment Disputes</h2>
          <p>When you place an order through Manikanta Super Market, you authorize the applicable payment provider to charge the payment method you selected for the total amount of your purchase.</p>
          <p>If you believe there is an issue with a transaction, please contact Manikanta Super Market first so that we can investigate and attempt to resolve the issue. Examples include duplicate charges, incorrect charges, payment processing errors, products not received, damaged products, etc.</p>
          <p>You agree not to intentionally initiate a false, fraudulent, or unauthorized payment dispute, chargeback, or claim. If you initiate a payment dispute or chargeback for a transaction that you authorized and received in accordance with these Terms, we reserve the right to provide the applicable transaction, order, shipping, delivery, communication, and other records to the applicable dispute-resolution authority.</p>
          <p>Nothing in these Terms is intended to restrict or eliminate any rights you may have under applicable law or the rules of your payment provider or card network. If a legitimate billing or transaction error occurs, please contact us promptly so we can review and resolve the issue.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">10. All Sales Are Final</h2>
          <p><strong>ALL SALES ARE FINAL.</strong></p>
          <p>Due to the nature of our products, Manikanta Super Market does not accept returns or exchanges for change of mind, incorrect selection, incorrect size, personal preference, or other reasons not specifically covered by our policies.</p>
          <p>Please carefully review your product selection, quantity, size, color, style, shipping information, and other order details before completing your purchase. By placing an order, you acknowledge and agree to our no-return and no-exchange policy.</p>
          <p className="mt-4 font-semibold text-gray-900">Shipping & Return Policy</p>
          <p>Please review our <Link to="/shipping-policy" className="text-brand-red underline font-semibold">Shipping Policy</Link> and <Link to="/returns-policy" className="text-brand-red underline font-semibold">Return & Exchange Policy</Link> for more details.</p>
          <p>The Shipping & Return Policy is incorporated into these Terms by reference.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">11. Shipping</h2>
          <p>Shipping terms, available shipping methods, estimated delivery times, shipping charges, and procedures for damaged or missing packages are described in our:</p>
          <p className="font-semibold text-gray-900">Shipping & Return Policy</p>
          <p>Please review our <Link to="/shipping-policy" className="text-brand-red underline font-semibold">Shipping Policy</Link> and <Link to="/returns-policy" className="text-brand-red underline font-semibold">Return & Exchange Policy</Link> for detailed information.</p>
          <p>Estimated delivery dates are estimates and are not guaranteed unless expressly stated otherwise.</p>
          <p>Shipping delays may occur due to circumstances outside our control, including carrier delays, weather, holidays, address issues, customs, transportation disruptions, or other unforeseen circumstances.</p>
          <p>Once an order has been handed over to the shipping carrier, carrier-related delays may be outside Manikanta Super Market' control.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">12. Incorrect or Incomplete Shipping Information</h2>
          <p>Customers are responsible for providing accurate shipping information during checkout.</p>
          <p>Please carefully verify:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Name</li>
            <li>Street address</li>
            <li>Apartment/unit number</li>
            <li>City</li>
            <li>State</li>
            <li>ZIP code</li>
            <li>Phone number</li>
          </ul>
          <p>Manikanta Super Market is not responsible for delays, failed deliveries, returned packages, or additional shipping costs resulting from incorrect or incomplete information provided by the customer.</p>
          <p>If an order is returned to us because of an incorrect or incomplete address, additional shipping charges may apply if reshipment is available.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">13. Damaged, Missing, or Incorrect Products</h2>
          <p>If you receive a product that is damaged, incorrect, or missing from your order, please follow the procedure described in our:</p>
          <p className="font-semibold text-gray-900">Shipping & Return Policy</p>
          <p>Please review our <Link to="/shipping-policy" className="text-brand-red underline font-semibold">Shipping Policy</Link> and <Link to="/returns-policy" className="text-brand-red underline font-semibold">Return & Exchange Policy</Link> for detailed information.</p>
          <p>You may be required to provide photographs, videos, packaging information, order information, or other documentation so that we can investigate the issue.</p>
          <p>To protect customers and prevent fraudulent claims, we may require that the package and its contents be documented promptly after delivery.</p>
          <p>Please review the Shipping & Return Policy for applicable reporting deadlines and procedures.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">14. No Cancellation Policy</h2>
          <p>Because orders may be processed shortly after purchase, cancellation requests may not always be possible.</p>
          <p>Once an order has entered processing, been packed, or been shipped, cancellation may not be available.</p>
          <p>If you need to request cancellation, contact us as soon as possible after placing your order.</p>
          <p>A cancellation request is not guaranteed to be accepted.</p>
          <p>If an order cannot be canceled, the applicable All Sales Are Final policy will apply.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">15. Refunds</h2>
          <p>Except where otherwise required by applicable law or specifically provided in our Shipping & Return Policy, purchases from Manikanta Super Market are final and are not eligible for refunds due to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Change of mind</li>
            <li>Incorrect selection</li>
            <li>Personal preference</li>
            <li>Incorrect size selection</li>
            <li>Ordering the wrong product</li>
            <li>No longer wanting the product</li>
            <li>Failure to review product information before purchase</li>
          </ul>
          <p>If a refund is approved under our Shipping & Return Policy or applicable law, the refund will generally be issued to the original payment method.</p>
          <p>Processing times may vary depending on the payment provider or financial institution.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">16. Promotions, Discounts, and Offers</h2>
          <p>From time to time, Manikanta Super Market may offer promotions, discounts, coupons, free products, or other special offers.</p>
          <p>Each promotion may have its own terms, including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Start and end dates</li>
            <li>Eligible products</li>
            <li>Minimum purchase requirements</li>
            <li>Quantity limitations</li>
            <li>Coupon restrictions</li>
            <li>Availability requirements</li>
          </ul>
          <p>Promotions may not be combined unless expressly stated.</p>
          <p>Manikanta Super Market reserves the right to modify, suspend, or terminate a promotion where permitted by applicable law.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">17. Gift Cards and Promotional Credits</h2>
          <p>If Manikanta Super Market offers gift cards, store credits, promotional credits, or similar products, additional terms may apply.</p>
          <p>Any applicable expiration dates, redemption restrictions, refund rules, or other conditions will be disclosed at the time the gift card or credit is issued.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">18. Intellectual Property</h2>
          <p>All content on the Manikanta Super Market website, including but not limited to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Brand names</li>
            <li>Logos</li>
            <li>Product photographs</li>
            <li>Product descriptions</li>
            <li>Graphics</li>
            <li>Designs</li>
            <li>Videos</li>
            <li>Text</li>
            <li>Website layout</li>
            <li>Marketing materials</li>
            <li>Images</li>
            <li>Product names</li>
          </ul>
          <p>is owned by or licensed to Manikanta Super Market and may be protected by applicable intellectual property laws.</p>
          <p>You may not copy, reproduce, modify, distribute, publish, sell, create derivative works from, or commercially exploit our website content without our prior written permission.</p>
          <p>Unauthorized use of our intellectual property is prohibited.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">19. Customer Reviews and Submitted Content</h2>
          <p>If you submit reviews, photographs, testimonials, comments, suggestions, or other content to Manikanta Super Market, you represent that:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>You have the right to submit the content.</li>
            <li>The content does not violate another person's rights.</li>
            <li>The content is not unlawful, fraudulent, defamatory, or misleading.</li>
            <li>The content does not contain malicious software or harmful code.</li>
          </ul>
          <p>By submitting content, you grant Manikanta Super Market a non-exclusive, worldwide, royalty-free license to use, reproduce, display, publish, modify, and distribute the content for legitimate business, marketing, promotional, or operational purposes, subject to applicable law and any separate permissions that may be required.</p>
          <p>We may remove submitted content that violates these Terms or applicable law.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">20. Prohibited Activities</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Use the website for unlawful purposes</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with website functionality</li>
            <li>Introduce malicious code or software</li>
            <li>Attempt to bypass security measures</li>
            <li>Use automated systems to scrape or copy website content without authorization</li>
            <li>Impersonate another person</li>
            <li>Use another person's account without authorization</li>
            <li>Provide false information</li>
            <li>Commit payment fraud</li>
            <li>Submit fraudulent chargebacks or disputes</li>
            <li>Abuse promotional offers</li>
            <li>Resell products in violation of applicable restrictions</li>
            <li>Use the website in a way that violates applicable law</li>
          </ul>
          <p>We reserve the right to suspend or terminate access for violations of these Terms.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">21. Website Availability</h2>
          <p>We attempt to keep the website available and functioning properly.</p>
          <p>However, we do not guarantee that the website will always be:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Available</li>
            <li>Error-free</li>
            <li>Secure</li>
            <li>Free from interruptions</li>
            <li>Free from viruses or other harmful components</li>
          </ul>
          <p>The website may occasionally be unavailable due to maintenance, upgrades, technical problems, security incidents, hosting issues, or circumstances outside our control.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">22. Third-Party Services</h2>
          <p>Our website may rely on third-party services, including payment processors, shipping providers, website hosting providers, analytics providers, marketing providers, authentication services, and other technology providers.</p>
          <p>Third-party services may have their own terms and privacy policies.</p>
          <p>Manikanta Super Market is not responsible for the independent policies, practices, availability, or performance of third-party services.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">23. Privacy</h2>
          <p>Your use of the Manikanta Super Market website is also governed by our Privacy Policy.</p>
          <p>Please review our <Link to="/privacy-policy" className="text-brand-red underline font-semibold">Privacy Policy</Link>.</p>
          <p>The Privacy Policy explains how we collect, use, disclose, retain, and protect personal information.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">24. Disclaimer of Warranties</h2>
          <p>To the maximum extent permitted by applicable law, the Manikanta Super Market website and its content are provided on an “as is” and “as available” basis.</p>
          <p>To the extent permitted by law, Manikanta Super Market disclaims warranties that are not expressly provided in these Terms, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
          <p>Nothing in these Terms excludes or limits warranties or rights that cannot legally be excluded or limited under applicable law.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">25. Limitation of Liability</h2>
          <p>To the maximum extent permitted by applicable law, Manikanta Super Market and its owners, employees, contractors, service providers, and affiliates will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages arising from or related to your use of the website or purchase of products.</p>
          <p>To the maximum extent permitted by applicable law, our total liability arising from a particular order or transaction will not exceed the amount you actually paid to Manikanta Super Market for the product or transaction giving rise to the claim.</p>
          <p>Nothing in these Terms is intended to exclude or limit liability that cannot legally be excluded or limited under applicable law.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">26. Indemnification</h2>
          <p>To the maximum extent permitted by applicable law, you agree to indemnify and hold harmless Manikanta Super Market, its owners, employees, contractors, and service providers from claims, damages, losses, liabilities, and reasonable expenses arising from your:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Violation of these Terms;</li>
            <li>Misuse of our website;</li>
            <li>Violation of applicable law; or</li>
            <li>Fraudulent, unauthorized, or unlawful activities.</li>
          </ul>
          <p>This provision does not require you to indemnify Manikanta Super Market for losses caused by Manikanta Super Market' own unlawful conduct, negligence, or other circumstances where such indemnification cannot legally be required.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">27. Governing Law</h2>
          <p>These Terms will be governed by applicable laws of the State of Texas, without regard to conflict-of-law principles, except where applicable law requires otherwise.</p>
          <p>Any dispute will be handled in accordance with applicable law and the dispute-resolution provisions contained in these Terms.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">28. Dispute Resolution</h2>
          <p>Before initiating formal legal proceedings regarding a dispute, we encourage you to contact Manikanta Super Market and give us an opportunity to investigate and attempt to resolve the issue.</p>
          <p>You may contact us using the information provided below.</p>
          <p>Nothing in this section limits any rights or remedies that cannot legally be waived.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">29. Changes to These Terms</h2>
          <p>We may update these Terms from time to time.</p>
          <p>Changes may be made due to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Changes to our business</li>
            <li>Changes to products or services</li>
            <li>Changes to website functionality</li>
            <li>Changes to payment or shipping providers</li>
            <li>Changes to applicable law</li>
            <li>Changes to our policies</li>
          </ul>
          <p>When we update these Terms, we will update the “Last Updated” date.</p>
          <p>Your continued use of the website after updated Terms become effective constitutes acceptance of the updated Terms, to the extent permitted by applicable law.</p>
          <p>For material changes where required by law, we may provide additional notice.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">30. Severability</h2>
          <p>If any provision of these Terms is determined to be invalid, unlawful, or unenforceable, the remaining provisions will continue to apply to the extent permitted by applicable law.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">31. Entire Agreement</h2>
          <p>These Terms, together with our Privacy Policy and other policies expressly incorporated into these Terms, constitute the agreement between you and Manikanta Super Market concerning your use of the website and purchases made through the website, except where additional terms are expressly provided.</p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4">32. Contact Us</h2>
          <p>If you have questions regarding these Terms, an order, payment, or another issue, please contact us:</p>
          <ul className="list-none pl-0 space-y-2 font-medium">
            <li><strong>Manikanta Super Market</strong></li>
            <li>Email: <a href="mailto:mani.worriers@gmail.com" className="text-brand-red underline">mani.worriers@gmail.com</a></li>
            <li>Website: <a href="https://manikantasupermarket.com" target="_blank" rel="noopener noreferrer" className="text-brand-red underline">https://manikantasupermarket.com</a></li>
            <li>Address: Aspari main road opposite APGB Bank, 518347</li>
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
}
