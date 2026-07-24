import {
    Check,
    ChevronDown,
} from "lucide-react";
import {
    useEffect,
    useRef,
    useState,
} from "react";
import { DROPDOWN_COLORS } from "../../constants/dropdownColors";
import "../../styles.css";


interface Props {
    value: string;
    options: string[];
    onChange: (value: string) => void;
    disabled?: boolean;
}
function getColorStyle(value: string): React.CSSProperties {
    const colors =
        DROPDOWN_COLORS[
        value as keyof typeof DROPDOWN_COLORS
        ];

    if (!colors) {
        return {};
    }

    return {
        backgroundColor: colors.background,
        color: colors.color,
    };
}

export default function Dropdown({
    value,
    options,
    onChange,
    disabled,
}: Props) {
    const [open, setOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(
        Math.max(0, options.indexOf(value))
    );

    const ref =
        useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(
            event: MouseEvent,
        ) {
            if (
                ref.current &&
                !ref.current.contains(
                    event.target as Node,
                )
            ) {
                setOpen(false);
            }
        }

        window.addEventListener(
            "mousedown",
            handleClickOutside,
        );

        return () =>
            window.removeEventListener(
                "mousedown",
                handleClickOutside,
            );
    }, []);
    useEffect(() => {
        setHighlightedIndex(
            Math.max(0, options.indexOf(value))
        );
    }, [value, options]);
    function handleKeyDown(
        e: React.KeyboardEvent<HTMLButtonElement>,
    ) {
        if (disabled) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();

                if (!open) {
                    setOpen(true);
                }

                setHighlightedIndex((prev) =>
                    (prev + 1) % options.length
                );
                break;

            case "ArrowUp":
                e.preventDefault();

                if (!open) {
                    setOpen(true);
                }

                setHighlightedIndex((prev) =>
                    (prev - 1 + options.length) %
                    options.length
                );
                break;

            case "Enter":
            case " ":
                e.preventDefault();

                if (!open) {
                    setOpen(true);
                } else {
                    onChange(options[highlightedIndex]);
                    setOpen(false);
                }
                break;

            case "Escape":
                setOpen(false);
                break;
        }
    }

    return (
        <div
            ref={ref}
            className="dropdown"
        >
            <button
                type="button"
                className="dropdown-trigger"
                style={getColorStyle(value)}
                disabled={disabled}
                onKeyDown={handleKeyDown}
                onClick={() =>
                    setOpen(!open)
                }
            >
                <span>
                    {value || "Select..."}
                </span>

                <ChevronDown
                    size={16}
                    className={
                        open
                            ? "dropdown-chevron open"
                            : "dropdown-chevron"
                    }
                />
            </button>

            {open && (
                <div className="dropdown-menu">
                    {options.map((option, index) => (
                        <button
                            key={option}
                            type="button"
                            className={`dropdown-item ${index === highlightedIndex
                                    ? "highlighted"
                                    : ""
                                } ${option === value ? "active" : ""
                                }`}
                            style={getColorStyle(option)}
                            onClick={() => {
                                console.log("Dropdown:", option);

                                onChange(option);

                                setOpen(false);
                            }}
                        >
                            <span>{option}</span>

                            {option === value && (
                                <Check size={14} />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}