import React, {useState} from "react";
import { ChevronUp, ChevronDown } from "react-feather";

function FAQItem({faq}) {
    const {
        question,
        answer,
        links
    } = faq;
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

export default FAQItem