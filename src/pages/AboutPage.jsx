export default function AboutPage() {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">About FR Family Investments</h1>
          <p className="text-lg text-gray-600">Empowering families through smart real estate investments</p>
        </div>

        {/* Company Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Who We Are</h2>
          <p className="text-gray-700 mb-4">
            FR Family Investments is a leading real estate platform dedicated to helping families and individuals find their perfect properties. With years of experience in the real estate market, we understand the unique needs of investors, homebuyers, and property seekers.
          </p>
          <p className="text-gray-700 mb-4">
            Our mission is to simplify the real estate process by providing a transparent, user-friendly platform where properties are showcased with detailed information, high-quality images, and seamless appointment scheduling.
          </p>
          <p className="text-gray-700">
            We believe in building long-term relationships with our clients based on trust, professionalism, and exceptional service.
          </p>
        </section>

        {/* Mission & Vision */}
        <section className="mb-12 grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Our Mission</h3>
            <p className="text-gray-700">
              To provide a comprehensive real estate platform that connects buyers, sellers, and investors, making property discovery and transactions seamless and transparent.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Our Vision</h3>
            <p className="text-gray-700">
              To become the most trusted real estate platform in the market, known for innovation, integrity, and customer-centric solutions.
            </p>
          </div>
        </section>

        {/* Core Values */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 border border-gray-200 rounded-lg">
              <h4 className="text-lg font-bold mb-2">Transparency</h4>
              <p className="text-gray-600">We believe in open communication and honest dealings in every transaction.</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <h4 className="text-lg font-bold mb-2">Excellence</h4>
              <p className="text-gray-600">We strive for the highest standards in service quality and customer satisfaction.</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <h4 className="text-lg font-bold mb-2">Innovation</h4>
              <p className="text-gray-600">We continuously improve our platform to meet evolving customer needs.</p>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Our Team</h2>
          <p className="text-gray-700 mb-6">
            Our team consists of experienced real estate professionals, technology experts, and customer service specialists who are passionate about delivering exceptional results.
          </p>
          <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
            <h4 className="text-lg font-bold mb-2">Leadership</h4>
            <p className="text-gray-600">
              Led by founders with extensive background in real estate and technology, our leadership team brings decades of combined experience to guide the company's vision and growth.
            </p>
          </div>
        </section>

        {/* Commitment */}
        <section className="bg-blue-50 p-8 rounded-lg border border-blue-200">
          <h3 className="text-xl font-bold mb-4">Our Commitment to You</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-3">✓</span>
              <span>Providing accurate and up-to-date property information</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-3">✓</span>
              <span>Offering responsive customer support and assistance</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-3">✓</span>
              <span>Maintaining the highest standards of security and privacy</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-3">✓</span>
              <span>Simplifying the real estate journey for all our users</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
