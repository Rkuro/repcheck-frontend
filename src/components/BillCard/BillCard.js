// BillCard.js
import React from 'react';
import './BillCard.css';
import { mapLevel } from '../../utils';
import VoteCard from '../VoteCard/VoteCard';
import { startCase } from 'lodash';
import { NavLink } from 'react-router-dom';

function BillCard({ bill, representatives }) {
  const {
    id,
    title,
    sources,
    classification,
    identifier,
    latest_action_description,
    latest_action_date,
    sponsorships,
    openstates_url,
    jurisdiction,
    votes,
  } = bill;

  // Determine the level based on the jurisdiction classification
  const level = jurisdiction ? jurisdiction.classification : 'unknown';

  const levelColors = {
    country: 'var(--federal-color)',
    state: 'var(--state-color)',
    municipality: 'var(--local-color)',
  };

  const cardStyle = {
    borderLeftColor: levelColors[level] || 'var(--default-color)',
  };

  const badgeStyle = {
    backgroundColor: levelColors[level] || 'var(--default-color)',
  };

  // Get primary sponsor(s)
  const primarySponsors = sponsorships
    ? sponsorships.filter((s) => s.primary).map((s) => s.name).join(', ')
    : 'N/A';

  const mostRecentVote = votes.reduce((latest, vote) =>
    !latest || new Date(vote.start_date) > new Date(latest.start_date) ? vote : latest,
    null
  );

  return (
    <NavLink to={`/bill/${encodeURIComponent(id)}`} className="bill-card-nav" style={cardStyle}>
      <div className="bill-card">
        <div className="bill-card-header">
          <span className="bill-level" style={badgeStyle}>
            {level ? mapLevel(level) : 'UNKNOWN'}
          </span>
          <div className="bill-id-and-vote">
            <p className="bill-identifier">{identifier || 'No Identifier'}</p>
          </div>
        </div>
        <h2 className="bill-title">{title || 'No Title'}</h2>
        <p className="bill-latest-action">
          <strong>Latest Action:</strong> {latest_action_description || 'N/A'} on{' '}
          {latest_action_date ? new Date(latest_action_date).toLocaleDateString() : 'N/A'}
        </p>
        <p className="bill-sponsors">
          <strong>Primary Sponsor:</strong> {primarySponsors}
        </p>
        <p className="bill-type">
          <strong>Type:</strong> {startCase(classification)}
        </p>
        {/* Representative Votes */}

        {
          mostRecentVote ? (
            <div className="bill-latest-vote">
              <p><strong>Latest Vote:</strong></p>
              <VoteCard voteInfo={mostRecentVote} representatives={representatives} />
            </div>
          ) : (
            <p>No votes recorded for this bill yet.</p>
          )
        }
      </div>
    </NavLink>
  );
}

export default BillCard;
