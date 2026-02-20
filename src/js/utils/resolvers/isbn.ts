import { v4 as uuid } from 'uuid';

import { ResponseError } from 'utils/error';

const OPEN_LIBRARY_USER_AGENT =
    'AcademicBloggersToolkit/1.0 (https://github.com/dsifford/academic-bloggers-toolkit; mailto:open-source)';

interface OpenLibraryEdition {
    key: string;
    title?: string;
    full_title?: string;
    publishers?: string[];
    publish_date?: string;
    number_of_pages?: number;
    isbn_13?: string[];
    isbn_10?: string[];
    authors?: Array<{ key: string }>;
}

interface OpenLibraryAuthor {
    name?: string;
    personal_name?: string;
}

function parseAuthorName(author: OpenLibraryAuthor): { family: string; given?: string } {
    const raw = author.name || author.personal_name || '';
    const trimmed = raw.trim();
    if (!trimmed) {
        return { family: 'Unknown' };
    }
    const lastSpace = trimmed.lastIndexOf(' ');
    if (lastSpace <= 0) {
        return { family: trimmed };
    }
    return {
        family: trimmed.slice(lastSpace + 1),
        given: trimmed.slice(0, lastSpace),
    };
}

function buildCslFromEdition(
    edition: OpenLibraryEdition,
    authors: Array<{ family: string; given?: string }>,
    isbn: string,
    isChapter: boolean,
): CSL.Data {
    const title = edition.full_title || edition.title || '';
    const publisher = edition.publishers?.[0];
    const issued = edition.publish_date
        ? { raw: edition.publish_date }
        : undefined;
    const data: CSL.Data = {
        id: uuid(),
        type: isChapter ? 'chapter' : 'book',
        title,
        author: authors.length ? authors : undefined,
        publisher,
        issued,
        ISBN: isbn,
    };
    if (edition.number_of_pages != null) {
        data['number-of-pages'] = edition.number_of_pages;
    }
    return data;
}

export async function get(
    ISBN: string,
    isChapter = false,
): Promise<CSL.Data | ResponseError> {
    const cleanIsbn = ISBN.replace(/-/g, '');
    const url = `https://openlibrary.org/isbn/${cleanIsbn}.json`;
    const response = await fetch(url, {
        headers: {
            Accept: 'application/json',
            'User-Agent': OPEN_LIBRARY_USER_AGENT,
        },
    });
    if (!response.ok) {
        return new ResponseError(ISBN, response);
    }
    const edition: OpenLibraryEdition = await response.json();
    if (!edition.title && !edition.full_title) {
        return new ResponseError(ISBN, response);
    }
    const authorKeys = edition.authors?.map((a) => a.key).filter(Boolean) ?? [];
    const authorKeysToFetch = authorKeys.slice(0, 10);
    const authorResponses = await Promise.all(
        authorKeysToFetch.map((key) =>
            fetch(`https://openlibrary.org${key}.json`, {
                headers: {
                    Accept: 'application/json',
                    'User-Agent': OPEN_LIBRARY_USER_AGENT,
                },
            }),
        ),
    );
    const authorBodies = await Promise.all(
        authorResponses.map((r) => (r.ok ? r.json() : Promise.resolve(null))),
    );
    const authors = authorBodies
        .filter((a): a is OpenLibraryAuthor => a != null)
        .map(parseAuthorName);
    return buildCslFromEdition(edition, authors, cleanIsbn, isChapter);
}
