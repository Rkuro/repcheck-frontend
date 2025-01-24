import React, { useEffect, useState } from "react";
import "./VoteCard.css"
import { startCase } from "lodash";
import { Check, X, AlertTriangle } from "react-feather"
import { getRepsById } from "../../services/repcheck_backend/api";
import { replaceUrlPrefix } from "../../utils";

function VoteCard({ voteInfo, representatives }) {

    const {
        motion_text,
        start_date,
        result,
        votes,
        counts
    } = voteInfo

    let userRepIds = representatives.map(rep => rep.id);
    let userRepVotes = []
    votes.forEach((vote) => {
        if (userRepIds.includes(vote.voter_id)) {
            userRepVotes.push({
                vote: vote,
                rep: representatives.find(rep => rep.id === vote.voter_id)
            })
        }
    });
    const allRepIds = voteInfo.votes.map(vote => vote.voter_id)

    const [loading, setLoading] = useState(true);
    const [repsData, setRepsData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const reps = await getRepsById(allRepIds);
                setRepsData(reps);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        // fetchData();
    }, [allRepIds, loading])

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
                            <div key={count.option} className="counts-block">
                                {startCase(count.option)}: {count.value}
                            </div>
                        )
                    })
                    }
                </div>
            </div>
            <div className="rep-votes">
                {
                    userRepVotes.length > 0 && <p><strong>Your reps' votes:</strong></p>
                }
                <div className="rep-votes-grid">
                    {userRepVotes.map((rep_vote) =>
                    (
                        <div key={rep_vote.rep.id} className="voter-rep-vote">
                            <div className="vote-header">
                                <div className="rep-image-small">
                                    <img alt="Representative headshot" src={replaceUrlPrefix(rep_vote.rep.image) || '/Person_Image_Placeholder.png'} onError={handleImageError} />
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
                                                <X size={24} color="white" />
                                            </div>
                                        </div>
                                    )}
                                    {!["yes", "no"].includes(rep_vote.vote.option) && (
                                        <div className="rep-vote-vote">
                                            <p>{rep_vote.rep.name} voted neither for or against and was: "{startCase(rep_vote.vote.option)}"</p>
                                            <div>
                                                <AlertTriangle size={24} color="orange" />
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