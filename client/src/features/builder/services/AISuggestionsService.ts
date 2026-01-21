import type { DatasetColumn } from "./DatasetService";
import type { WidgetType } from "../types";

export interface AISuggestion {
    recommendedType: WidgetType;
    reasoning: string;
    confidence: number;
}

export const AISuggestionsService = {
    suggestChartType: (fields: DatasetColumn[]): AISuggestion => {
        // Basic Heuristic Logic
        const hasDate = fields.some(f => f.type === 'date');
        const numberCount = fields.filter(f => f.type === 'number').length;
        const stringCount = fields.filter(f => f.type === 'string').length;

        if (hasDate && numberCount >= 1) {
            return {
                recommendedType: 'line',
                reasoning: 'Time-series data detected. Line charts are best for trends over time.',
                confidence: 0.95
            };
        }

        if (stringCount === 1 && numberCount >= 1) {
            return {
                recommendedType: 'bar',
                reasoning: 'categorical data with values detected. Bar charts are optimal for comparing categories.',
                confidence: 0.90
            };
        }

        if (stringCount === 1 && numberCount === 0) {
            return {
                recommendedType: 'table',
                reasoning: 'Only text data available. A table is the best way to view raw records.',
                confidence: 0.80
            };
        }

        if (numberCount >= 2) {
            return {
                recommendedType: 'scatter',
                reasoning: 'Multiple numeric variables detected. scatter plots help visualize correlations.',
                confidence: 0.85
            };
        }

        return {
            recommendedType: 'bar',
            reasoning: 'Standard bar chart suggested for general data.',
            confidence: 0.5
        };
    }
};
