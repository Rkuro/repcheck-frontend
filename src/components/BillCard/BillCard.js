// BillCard.js
import React from 'react';
import './BillCard.css';
import { mapAreaId } from '../../utils';
import VoteCard from '../VoteCard/VoteCard';
import { startCase } from 'lodash';
import { NavLink } from 'react-router-dom';

function BillCard({ bill, representatives }) {
	const {
		id,
		title,
		classification,
		actions,
		canonical_id,
		sponsorships,
		jurisdiction_area_id,
		votes
	} = bill;

	const level = mapAreaId(jurisdiction_area_id);

	const levelColors = {
		federal: 'var(--federal-color)',
		state: 'var(--state-color)',
		local: 'var(--local-color)',
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

	const latestAction = actions.length > 0 && actions.reduce(
		(latest, action) => new Date(action.date) > new Date(latest.date) ? action : latest
	);
	const latestActionDate = latestAction.date
	const latestActionDescription = latestAction.description

	let mostRecentVote = undefined;
	if (votes !== null) {
		mostRecentVote = votes.reduce((latest, vote) =>
			!latest || new Date(vote.start_date) > new Date(latest.start_date) ? vote : latest,
			null
		);
	}

	return (
		<NavLink to={`/bill/${encodeURIComponent(id)}`} className="bill-card-nav" style={cardStyle}>
			<div className="bill-card">
				<div className="bill-card-header">
					<span className="bill-level" style={badgeStyle}>
						{level ? startCase(level) : 'UNKNOWN'}
					</span>
					<div className="bill-id-and-vote">
						<p className="bill-identifier">{latestActionDate ? new Date(latestActionDate).toLocaleDateString() : 'No actions recorded'}</p>
					</div>
				</div>
				<h2 className="bill-title">{title || 'No Title'}</h2>
				<p className="bill-latest-action">
					<strong>Latest Action:</strong> {latestActionDescription || 'N/A'}
				</p>
				<p className="bill-latest-action">
					<strong>Bill Identifier:</strong> {canonical_id}
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
