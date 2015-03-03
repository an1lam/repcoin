'use strict';

var Footer = require('./Footer.jsx');
var Toolbar = require('./Toolbar.jsx');
var React = require('react');
var strings = require('../lib/strings_utils.js');

var AboutPage = React.createClass({
  render: function() {
    return (
      <div className="aboutPage">
        <div className="row">
          <Toolbar />
        </div>
        <div className="row">
          <div className="col-md-8 col-md-offset-1 aboutContent">
            <h1>Repcoin FAQ</h1>
            <br/>
            <h2>What is Repcoin?</h2>
            <p>Repcoin is a market for reputation. As you turn to the internet more and more for entertainment
                and information, it becomes harder to find good content. And, for those putting content online,
                from artists to athletes, it becomes harder to get found. Repcoin is a discovery platform.
                Users can sign up as an investor or expert for a self-proclaimed skill. Investors give reps
                to experts they believe in, and they can make huge returns from those investments. This helps your
                choice experts trend online and get found. It also boosts the investor's credibility for finding talent.
                Repcoin's data creates reliable and universal reputation. It can be shared all over the web, so that
                your comments anywhere can be annotated with your Repcoin score.
            </p>
            <br />
            <h2>How do I get Reps as an expert?</h2>
            <p>Experts get found as investors gravitate to your content. Make sure you bolster your profile
              with links to your material. As investors find you, you can start trending on the leaderboards for
              your various skills. Your work outside of Repcoin is recognized by investors within the Repcoin platform.
            </p>
            <br />
            <h2>How do I get Reps as an investor?</h2>
            <p>Investors always start out with 5 reps to spend. And, if you spend all of them, you will
              get another 5 over night. But this trickle of reps isn't enough to make serious impact. For that,
              you'll need to accrue dividends from your investments. Each investment is associated with a dividend,
              and dividends are paid every night. As other investors give reps to your experts, your dividends increase.
            </p>
            <br />
            <h2>How are my dividends calculated?</h2>
            <p>We calculate dividends with a simple formula: dividend = (scaling_factor * expert_total * percentage)/100.
              The scaling factor is just a divisor that makes your dividend value small.  The expert total is the
              expert's total reps for the category you've invested in. And the percentage is the percent of the expert's
              reps that you owned for that category at the time of your investment. This is the key to increasing dividends.
              Suppose you gave someone 4 reps, and their total was 10. You'd own 40% of their reps for that category at
              investment time. If that expert blows up to 100 reps, your dividend also grows by 10 times.
            </p>
            <br />
            <h2>What is my rank?</h2>
            <p>Every investor and expert has a rank for each of their categories. The rank is relative
              to all competing investors or experts in a given category. For investors, rank is calculated by total
              dividends. For experts, the rank is calculated by total reps.
            </p>
            <br />
            <h2>How are all time leaderboards calculated?</h2>
            <p>All time leaders are simply the leaders with the highest rank.</p>
            <br />
            <h2>How are trending experts calculated?</h2>
            <p>Trending over a given time period is determined by which experts had the most 'gives' in that time.
              This is different from getting the most reps over that time, and it's also different from the rank.
            </p>
            <br />
            <h2>How can I get noticed faster?</h2>
            <p>Soon, Repcoin will be supporting paid promotion in the Feed! Site members will be able to pay to
              have customized promotional message show up in the Feed. Stay tuned.
            </p>
          </div>
        </div>
        <div className="row footerrow">
          <Footer />
        </div>
      </div>
    );
  }
});

module.exports = AboutPage;
