import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import './AboutPage.css';

function FAQItem({faq}) {
    const {
        question,
        answer,
        links
    } = faq;
    console.log(faq)
    const [isOpen, setIsOpen] = useState(false);

    const toggleFAQ = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="faq-item" onClick={toggleFAQ}>
            <div className="faq-question">
                <h3>{question}</h3>
                <span>{isOpen ? <ChevronUp/> : <ChevronDown />}</span>
            </div>
            {isOpen && (
                <div className="faq-answer">
                    <div>{answer}</div>
                    <div className='faq-links'>
                        {links && links.map(link => (
                            <a href={link.url} className='faq-link'>{link.note}</a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function AboutPage() {
    const faqs = [
        {
            question: "What is RepCheck?",
            answer: "RepCheck is a platform designed to simplify checking the actions of elected officials on behalf of the citizenry.  The idea is to answer simple questions quickly, such as 'Who are my representatives?' 'How are they voting on my behalf?'.  RepCheck is not designed for a full one-stop shop on all things related to government affairs, but rather as an executive look into the difficult and messy world of government.",
        },
        {
            question: "How did RepCheck start?",
            answer: "RepCheck began as a side project aimed at improving the transparency and ease-of-access of legislative affairs for everyday citizens.",
        },
        {
            question: "Why ZIP Codes?",
            answer: "Everybody knows their zip code. Almost nobody knows their state senate district. It's much easier to anchor on a standard that folks already are familiar with rather than try and lead people the other direction.",
        },
        {
            question: "Where does the data come from?",
            answer: "Fortunately, there are lots of projects that already exist that are aimed at making government transparent and available to the public. RepCheck relies on many sources of data but primarily 1) The U.S. Census for geospatial data such as zip codes and districts 2) Plural Open (fka OpenStates) open source data libraries which are able to download legislator and bill/vote information which in turn relies upon official government websites such as congress.gov, govinfo.gov, and numerous state level websites. Some helpful links to open source data/code:",
            links: [
                {
                    note: "Plural Open (FKA OpenStates)",
                    url: "https://docs.openstates.org/"
                },
                {
                    note: "Census Data",
                    url: "https://data.census.gov/"
                },
                {
                    note: "RepCheck Data Integration (Ingesting data from public sources)",
                    url: "https://github.com/Rkuro/repcheck-data-integration"
                },
                {
                    note: "RepCheck Frontend (this website)",
                    url: "https://github.com/Rkuro/repcheck-frontend"
                },
                {
                    note: "RepCheck Backend",
                    url: "https://github.com/Rkuro/repcheck"
                }
            ]
        },
        {
            question: "How often is data updated?",
            answer: "The engineering answer to this question is somewhat complicated but typically things update once a day. We also do not yet have many things integrated at all such as state level representatives for Vermont, New Hampshire, or North Dakota, and state-level bills for most states. RepCheck is quite new so things may likely be unstable as of yet."
        },
        {
            question: "How can I know whether data is correct/missing?",
            answer: "Ideally there is a way to trace back how the information was integrated into this site for consumption, however that way is slim as of yet. Fortunately this information all exists online in public places so if you are feeling adventerous you may always go sailing."
        }
    ];

    return (
        <div className="about-page">
            <div className="about-page-header">
                <h1>About RepCheck</h1>
            </div>
            <div className="about-page-description">
                <p>
                    RepCheck was born out of a desire to create a transparent and reliable tool where
                    citizens can track, and verify how their representatives at every level are well..
                    representing them.
                </p>
            </div>
            <h2>Frequently Asked Questions</h2>
            <div className="about-page-faqs">
                {faqs.map((faq, index) => (
                    <FAQItem key={index} faq={faq} />
                ))}
            </div>
        </div>
    );
}

export default AboutPage;
