// BillPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import './BillPage.css';
import { ZipCodeContext } from '../../contexts/ZipCodeContext';
import { mapLevel } from '../../utils';
import { getBill, getReps } from '../../services/repcheck_backend/api';
import VoteCard from '../../components/VoteCard/VoteCard';
import { startCase } from 'lodash';

const BillPage = () => {
  const { billId } = useParams();
  const { zipCode } = useContext(ZipCodeContext);
  const [billData, setBillData] = useState(null);
  const [repsData, setRepsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const bill = await getBill(billId);
        const reps = await getReps(zipCode);
        setBillData(bill);
        setRepsData(reps);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [billId, zipCode]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!billData) {
    return <div className="error">Error loading bill data.</div>;
  }

  const {
    jurisdiction
  } = billData;

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

  const uniqueVersionUrls = Array.from(
    new Set(
      billData.versions.flatMap((version) =>
        version.links.map((link) => link.url)
      )
    )
  );

  return (
    <div className="bill-details-page" style={cardStyle}>
      <div className="bill-details-header">
        <span className="bill-level" style={badgeStyle}>
          {level ? mapLevel(level) : 'UNKNOWN'}
        </span>
      </div>
      <h3 className="bill-details-title">{billData.title || 'Bill Title Not Available'}</h3>

      <div className="bill-details-section">
        <h2>Details</h2>
        <ul>
          <li><strong>Identifier:</strong> {billData.identifier}</li>
          <li><strong>Session:</strong> {billData.session}</li>
          <li><strong>Status:</strong> {billData.latest_action_description}</li>
          <li><strong>Subjects:</strong> {billData.subject?.join(', ') || 'None'}</li>
          <li><strong>Latest Action Date:</strong> {billData.latest_action_date}</li>
        </ul>
      </div>

      <div className="bill-details-section">
        <h2>Sponsorships</h2>
        {billData.sponsorships && billData.sponsorships.length > 0 ? (
          <ul>
            {billData.sponsorships.map((sponsor, index) => (
              <li key={index}>
                {sponsor.person ? sponsor.person.name : sponsor.name}  ( {startCase(sponsor.classification)} )
              </li>
            ))}
          </ul>
        ) : (
          <p>No sponsorships available.</p>
        )}
      </div>

      <div className="bill-details-section">
        <h2>Actions</h2>
        {billData.actions && billData.actions.length > 0 ? (
          <ul>
            {billData.actions.map((action, index) => (
              <li key={index}>
                <strong>{new Date(action.date).toLocaleDateString()}:</strong> {action.description}
              </li>
            ))}
          </ul>
        ) : (
          <p>No actions available.</p>
        )}
      </div>

      <div className="bill-details-section">
        <h2>Votes</h2>
        {billData.votes && billData.votes.length > 0 ? (
          billData.votes.map((vote, index) => (
            <VoteCard key={vote.id} voteInfo={vote} representatives={repsData} />
          ))
        ) : (
          <p>No votes available.</p>
        )}
      </div>

      <div className="bill-details-section">
        <h2>Documents</h2>
        {billData.documents && billData.documents.length > 0 ? (
          <ul>
            {billData.documents.map((doc, index) => (
              <li key={index}>
                <a href={doc.links[0].url} target="_blank" rel="noopener noreferrer">
                  {doc.note || 'Document'}
                </a> {doc.date && <p>({doc.date})</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p>No documents available.</p>
        )}
      </div>

      <div className="bill-details-section">
        <h2>Versions</h2>
        {billData.versions && billData.versions.length > 0 ? (
          <ul className="bill-details-versions">
            {uniqueVersionUrls.map((url, index) => (
              <li>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {url || 'Version'}
                </a>
              </li>
            ))
            }

          </ul>
        ) : (
          <p>No versions available.</p>
        )}
      </div>
    </div>
  );
};

export default BillPage;
