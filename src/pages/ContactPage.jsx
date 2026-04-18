import { useState } from 'react';
import { toast } from 'react-toastify';

export default function ContactPage() {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600">Get in touch with FR Family Investments</p>
        </div>

        <div className="max-w-2xl mx-auto text-center">
          {/* Contact Information */}
          <div className="space-y-8">
            {/* Email */}
            <div>
              <h3 className="text-lg font-bold mb-2">Email</h3>
              <a
                href="mailto:support@frfamilyinvestments.com"
                className="text-blue-600 hover:text-blue-700 transition-colors text-xl"
              >
                support@frfamilyinvestments.com
              </a>
              <p className="text-gray-600 mt-2">
                For any questions or inquiries, please contact us at the email above.
              </p>
            </div>

            {/* Phone */}
            <div>
              <h3 className="text-lg font-bold mb-2">Phone</h3>
              <a
                href="tel:+18179071638"
                className="text-blue-600 hover:text-blue-700 transition-colors text-xl"
              >
                +1 (817) 907-1638
              </a>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-bold mb-2">Office Address</h3>
              <p className="text-gray-700">
                FR Family Investments<br />
                P.O. Box 568<br />
                Lillian, TX 76061<br />
                United States
              </p>
            </div>

            {/* Business Hours */}
            <div>
              <h3 className="text-lg font-bold mb-2">Business Hours</h3>
              <p className="text-gray-700">
                Monday - Friday: 9:00 AM - 6:00 PM<br />
                Saturday: 10:00 AM - 4:00 PM<br />
                Sunday: Closed
              </p>
            </div>

            {/* Owner */}
            <div>
              <h3 className="text-lg font-bold mb-2">Owner</h3>
              <p className="text-gray-700">
                Fermín Martinez
              </p>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-lg font-bold mb-3">Follow Us</h3>
              <div className="flex gap-4 justify-center">
                <a
                  href="https://www.facebook.com/people/Fermin-Martinez/pfbid0JiMwPPwGNaZmds3FEiHJi9vqHgc7nJhY7d5UxSmQZd7T64otBvH6VG5WBYX8ScCCl/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Facebook
                </a>
                <a
                  href="https://www.instagram.com/frfamilyinvestments"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:text-pink-700 font-semibold"
                >
                  Instagram
                </a>
                <a
                  href="https://www.tiktok.com/@fr.family.investm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 hover:text-gray-700 font-semibold"
                >
                  TikTok
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
