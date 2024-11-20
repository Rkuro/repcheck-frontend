import React from "react";
import "./VoteCard.css"
import { startCase } from "lodash";
import { Check, XCircle, AlertTriangle } from "react-feather"

function VoteCard({ voteInfo, representatives }) {
    const {
        motion_text,
        start_date,
        result,
        votes,
        counts
    } = voteInfo

    let rep_ids = representatives.map(rep => rep.id);
    let rep_votes = []
    votes.forEach((vote) => {
        if (rep_ids.includes(vote.voter?.id)) {
            rep_votes.push({
                vote: vote,
                rep: representatives.find(rep => rep.id === vote.voter?.id)
            })
        }
    })

    const handleImageError = (e) => {
        e.target.onerror = null; // Prevents looping
        e.target.src = '/Person_Image_Placeholder.png'; // Place your placeholder image in the public folder
    };

    return (
        <div className="vote-card">
            <div className="vote-info">
                <p><strong>Motion:</strong> {motion_text}</p>
                <p><strong>Date:</strong> {new Date(start_date).toLocaleDateString()}</p>
                <p><strong>Result: </strong>{result ? startCase(result) : "No result recorded yet"}</p>
                <div className="vote-card-counts">
                    <strong>Counts:</strong> 
                        {counts.map(count => {
                            return (
                                <div className="counts-block">
                                    {startCase(count.option)}: {count.value}
                                </div>
                            )
                        })
                        }
                </div>
            </div>
            <div className="rep-votes">
                <p><strong>Your reps' votes:</strong></p>
                <div className="rep-votes-grid">
                    {rep_votes.map((rep_vote) =>
                    (
                        <div key={rep_vote.rep.id} className="voter-rep-vote">
                            <div className="vote-header">
                                <div className="rep-image-small">
                                    <img alt="Representative headshot" src={rep_vote.rep.image || '/Person_Image_Placeholder.png'} onError={handleImageError} />
                                </div>
                                <div className="rep-vote">
                                    {rep_vote.vote.option === "yes" && (
                                        <div className="rep-vote-vote">
                                            <p>{rep_vote.rep.name} voted in favor</p>
                                            <div className="icon-padding-yes">
                                                <Check size={24} color="white" />
                                            </div>
                                        </div>
                                    )}
                                    {rep_vote.vote.option === "no" && (
                                        <div className="rep-vote-vote">
                                            <p>{rep_vote.rep.name} voted against</p>
                                            <div className="icon-padding-no">
                                                <XCircle size={24} color="white" />
                                            </div>
                                        </div>
                                    )}
                                    {!["yes", "no"].includes(rep_vote.vote.option) && (
                                        <div className="rep-vote-vote">
                                            <p>{rep_vote.rep.name} voted neither for or against and was: "{startCase(rep_vote.vote.option)}"</p>
                                            <div>
                                                <AlertTriangle size={24} color="yellow"/>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                    )}
                </div>
            </div>
        </div>
    )
}

export default VoteCard;