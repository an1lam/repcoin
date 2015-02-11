var React = require('react');

var Footer = require('./Footer.jsx');
var Toolbar = require('./Toolbar.jsx');

var TermsOfServicePage = React.createClass({
  render: function() {
    return (
      <div className="termsOfServicePage">
        <div className="row">
          <Toolbar/>
        </div>
        <div className="row">
          <div className="termsOfService col-md-6 col-md-offset-3">
          <h1>Repcoin Terms of Service</h1>
          <p><strong>Thank you for using Repcoin!</strong> Repcoin’s products and services are all
          provided by Repcoin Inc. and can only be accessed and used by you
          under the terms and conditions described below. Please read these terms
          and conditions carefully before using our site and contact us if you
          have questions.</p>

          <p><strong>ANY PARTICIPATION IN THIS SITE WILL CONSTITUTE YOUR ACCEPTANCE OF THESE TERMS
          AND CONDITIONS. IF YOU DO NOT AGREE TO ABIDE BY THEM, PLEASE DO NOT USE THIS
          SITE.</strong></p>

          <h3>Your Data</h3>
          <p>By using Repcoin, you give up any right to the ownership of, or (except as
          limited below) to control the use of, data gathered from your account or
          otherwise obtained through your use of the site.</p>

          <p>Using Repcoin involves giving Repcoin certain personal data and
          generating transactional data through our market-based system. Repcoin
          will not share your data with third parties (other than Repcoin’s
          affiliated entities)
          other than in anonymized form.  In other words, your personal
          information will never be shared, but some of your raw transactional
          data may be.</p>

          <h3>Third Party Content</h3>
          <p>
              The reputational rankings and other opinions expressed by users of the site represent the individual views of such users and do not represent the opinions
              of Repcoin. In addition, the expert rankings displayed on this site reflect amalgamations of Repcoin users’ individual rankings and Repcoin assumes no
              responsibility for the accuracy or reliability of such individual or composite rankings or for any errors in calculating such rankings. Repcoin is not
              endorsing any of the individuals identified as experts on this site and also is not making any representations regarding the accuracy or reliability of any
              information or advice offered by such individuals on this site, any third party site linked to this site or otherwise.
          </p>
          <p>
              Repcoin makes no representations regarding, and is not liable for, the content and services offered by ads displayed on our site or recommended or
              otherwise referenced by other users of the site. Any claims made by third-party service providersin ads displayed on Repcoin cannot be verified or vouched
              for by Repcoin.
          </p>
          <h3>Security</h3>
          <p>
              We care about the security of your identity and data, and will take reasonable measures to keep your data safe and secure. However, Repcoin cannot
              guarantee that the security measures we take will be sufficient to prevent unauthorized third parties from accessing the data collected by Repcoin. If you
              believe your account or the site has been compromised, please notify us immediately.
          </p>
          <h3>Inappropriate Content</h3>
          <p>
              We don’t want to offend or upset our users and will attempt to respond promptly and respectfully to correspondence related to content that our users
              believe is inappropriate or offensive. However, Repcoin gives no assurance that this site will not display content that users find offensive or otherwise
              inappropriate and Repcoin reserves the right to determine, in its sole discretion, whether content on the site will be retained or removed. Repcoin assumes
              no liability to any user in respect of content such user regards as offensive or otherwise inappropriate. By using Repcoin, you assume the risk of exposure
              to such content and waive any right to hold Repcoin liable under any theory of liability in respect of such exposure.
          </p>
          <h3>Termination</h3>
          <p>
              Repcoin reserves the right to terminate your account at any time in its sole discretion for any reason and without giving a cause. If you choose to
              terminate your account, Repcoin will retain all the rights to data you provided to Repcoin and generated through your site usage. See “Your Data” above.
          </p>
          <h3>Use of this Site.</h3>
          <p>
              Subject to full compliance with these terms and conditions, Repcoin grants authorized users a nonexclusive, nontransferable, nonsublicensable, terminable
              license to access and use the Sites and Services for your personal use. You agree to not access, reproduce, duplicate, copy, sell, re-sell, modify,
              distribute, transmit, or otherwise exploit the Sites or Services or any of their content for any purpose except for your personal use and as described in
              these terms and conditions, without the express written consent of Repcoin. Repcoin may modify, update, suspend or discontinue the Sites and Services, in
              whole or in part, at our sole discretion for any or no reason, at any time and with or without notice. Repcoin shall not be liable to any user or other
              third party for any such modification, update, suspension or discontinuance.
          </p>
          <p>
              As a condition of your access and use of the Sites and Services and your submission or access to any ratings, reviews, communications, information, data,
              text, photographs, audio clips, audiovisual works, or other materials on the Sites and Services (collectively, the “Content”), you agree not to use the
              Sites and Services for any purpose that is unlawful or prohibited by these Terms of Use, or any other purpose not reasonably intended by Repcoin. By way of
              example, and not as a limitation, you agree not to:
          </p>
          <ol type="a">
            <li>intentionally or unintentionally violate these Terms of Use, other applicable agreement with Repcoin, and any applicable local, state, national or
            international law, and any rules and regulations having the force of law;</li>

            <li>use the Sites and Services in any manner that violates any relevant law or that infringes, misappropriates or violates any third party's rights, including,
            but not limited to, transmitting any Content that may infringe, misappropriate or violate a third party's rights of publicity, contractual rights,
            fiduciary rights or intellectual property rights;</li>

            <li>use the Sites and Services or its Content for any purposes not authorized by this Terms of Use, including commercial, political, or religious purposes,
            including the submission or transmission of any Content that contains advertisements, promotional materials, junk mail, or any other form of solicitation;</li>

            <li>reproduce, duplicate, copy, modify, sell, re-sell or exploit any Content or the Sites and Services for any commercial, educational, or any other
            non-personal purpose or any for any purpose unrelated to your personal purchasing decisions, without the express written consent of Repcoin, which consent
            may be withheld by Repcoin in our sole discretion;</li>
            <li>post non-local or otherwise irrelevant Content, repeatedly post the same or similar Content or otherwise impose an unreasonable or disproportionately large
            load on our infrastructure, interfere or attempt to interfere with the proper working of the Sites and Services or any activities conducted on the Sites
            and Services;</li>
            <li>harass, threaten, intimidate, impersonate, or attempt to impersonate, any other person, falsify your contact or other information, misrepresent a
            relationship with any person or entity, including misrepresenting a relationship with Repcoin, or otherwise attempt to mislead others as to the identity of
            the sender or the origin of a review or rating;</li>
            <li>knowingly provide or submit false or misleading information;</li>
            <li>use the Sites and Services if you are under the age of eighteen (18);</li>

            <li>take any action that would undermine the review and rating process under the Sites and Services;</li>

            <li>attempt to gain unauthorized access to the Sites and Services, other user accounts, or other computer systems or networks connected to the Sites and Services;</li>

            <li>use the Sites and Services in any way that could interfere with the rights of Repcoin or the rights of other users of the Sites and Services;</li>

            <li>attempt to gain unauthorized access to any portion or feature of the Sites and Services, or any other systems or networks connected to the Sites and
            Services or to any server used by Repcoin by hacking, password 'mining' or any other illegitimate or unauthorized means, including attempting to obtain
            password, account, or any other personal or private information from any other Sites and Services user;</li>

            <li>sell, share, or otherwise transfer your account username, password, other information, or your rights or obligations under these Terms of Use;</li>

            <li>transmit or submit any transmission or other
            materials that are encrypted or that contains viruses, Trojan horses,
            worms, time bombs, spiders, cancelbots or other computer programming
            routines that is likely or intended to damage, interfere with, disrupt,
            impair, disable or otherwise overburden the Sites and Services;</li>

            <li>access, download, monitor, or copy any information contained on our Sites and Services through artificial means (including but not limited to use any
            'deep-link', 'scraper', 'robot', 'spider' or other automatic device, program, algorithm or methodology, or any similar or equivalent automatic or manual
            process, or in any way reproduce or circumvent the navigational structure or presentation of the Sites and Services or any content, to obtain or attempt to
            obtain any Content, materials, documents or information through any means not purposely made available through the Sites and Services; or</li>

            <li>probe, scan or test the vulnerability of the Sites and Services or any network connected to the Sites and Services, nor breach the security or
            authentication measures on or of the Sites and Services or any network connected to the Sites and Services. You may not reverse look-up, trace or seek to
            trace any information on any other user of the Sites and Services, or any other customer of Repcoin, including any Repcoin account not owned by you, to its
            source, or exploit the Sites and Services or any service or information made available or offered by or through the Sites and Services, in any way where
            the purpose is to reveal any information, including but not limited to personal identification or information other than your own information, except as
            expressly authorized by Repcoin and provided for by the Sites and Services;</li>
          </ol>

          <h2>General Terms</h2>
          <h3>Notification Procedures and Changes to these Terms.</h3>
          <p>Repcoin Inc. reserves the right to determine the form and means of providing notifications to you, and you agree to receive legal notices electronically if
          we so choose. We may revise these terms and conditions from time to time in our sole discretion with or without notifying you. If we determine, in our sole
          discretion, that a revision to these terms and conditions is material, we will notify you. By continuing to access or use this site after any such
          revisions become effective, you agree to be bound by the revised terms and conditions. If you do not agree to the new terms and conditions, please stop
          using this site.</p>

          <h3>Assignment</h3>
          <p>These terms and conditions, and any rights and licenses granted hereunder, may not be transferred or assigned by you, but may be assigned by Repcoin
          without restriction. Any attempted transfer or assignment in violation hereof shall be null and void.</p>

          <h3>Entire Agreement/Severability</h3>
          <p>If the latter, Privacy Policy and any amendments and any additional agreements you may enter into with Repcoin,, shall constitute the entire agreement
          between you and Repcoin concerning your use of this site and the products and services offered on this site. If any provision of these terms and conditions
          is deemed invalid, then that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions of these terms and
          conditions will remain in full force and effect.</p>

          <h3>No Waiver.</h3>
          <p>No waiver of any provision of these terms and conditions shall be deemed a further or continuing waiver of such term or any other term, and Repcoin’s
          failure to assert any right or provision under these terms and conditions shall not constitute a waiver of such right or provision.</p>
          </div>
        </div>
        <div className="row footerrow">
        <Footer/>
        </div>
      </div>
    );
  }
});

module.exports = TermsOfServicePage;
