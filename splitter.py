import re
from typing import Callable, Iterable, Literal


type KeepSep = bool | Literal["start", "end"]


def _split_text_with_regex(
    text: str,
    separator_pattern: str,
    keep_separator: KeepSep,
) -> list[str]:
    """
    Split `text` by `separator_pattern` (a regex pattern).
    Optionally keep the separator, either at the start or end of each piece.
    """
    if separator_pattern:
        if keep_separator:
            parts = re.split(f"({separator_pattern})", text)
            if keep_separator == "end":
                splits = [parts[i] + parts[i + 1] for i in range(0, len(parts) - 1, 2)]
            else:
                splits = [parts[i] + parts[i + 1] for i in range(1, len(parts), 2)]
            if len(parts) % 2 == 0:
                splits += parts[-1:]

            if keep_separator == "end":
                if parts and len(parts) % 2 == 1:
                    splits.append(parts[-1])
            else:
                if parts:
                    splits = [parts[0]] + splits
        else:
            splits = re.split(separator_pattern, text)
    else:
        splits = list(text)

    return [s for s in splits if s != ""]


class RecursiveCharacterSplitter:
    def __init__(
        self,
        *,
        chunk_size: int = 4000,
        chunk_overlap: int = 200,
        separators: None | list[str] = None,
        keep_separator: KeepSep = True,
        is_separator_regex: bool = False,
        length_function: Callable[[str], int] = len,
        strip_whitespace: bool = True,
    ) -> None:
        """
        - chunk_size: max length of each output chunk (by `length_function`)
        - chunk_overlap: overlap length between consecutive chunks (by `length_function`)
        - separators: priority-ordered list of separators to try (default per LC)
        - keep_separator: keep split separators ('start'/'end'/False; True == 'start')
        - is_separator_regex: treat each separator as a regex pattern
        - length_function: function for measuring length (default: len)
        - strip_whitespace: strip leading/trailing whitespace from final chunks
        """
        if chunk_overlap > chunk_size:
            raise ValueError(
                f"chunk_overlap ({chunk_overlap}) must be <= chunk_size ({chunk_size})"
            )
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.separators = separators or ["\n\n", "\n", " ", ""]
        self.keep_separator: KeepSep = "start" if keep_separator is True else keep_separator
        self.is_separator_regex = is_separator_regex
        self.length_function = length_function
        self.strip_whitespace = strip_whitespace

    def split_text(self, text: str) -> list[str]:
        return self._split_text_recursive(text, self.separators)

    def _split_text_recursive(self, text: str, separators: list[str]) -> list[str]:
        """
        - Choose the first separator that occurs in `text` (or fallback to the last),
        - Split by it, then recursively process oversize pieces using smaller separators.
        - Merge smaller splits into chunks bounded by chunk_size with overlap.
        """
        final_chunks: list[str] = []

        separator = separators[-1]
        remaining: list[str] = []
        for i, s in enumerate(separators):
            pattern = s if self.is_separator_regex else re.escape(s)
            if s == "":
                separator = s
                break
            if re.search(pattern, text):
                separator = s
                remaining = separators[i + 1 :]
                break

        sep_pattern = separator if self.is_separator_regex else re.escape(separator)
        splits = _split_text_with_regex(text, sep_pattern, self.keep_separator)

        good_splits: list[str] = []
        join_sep = "" if self.keep_separator else separator

        for s in splits:
            if self.length_function(s) < self.chunk_size:
                good_splits.append(s)
            else:
                if good_splits:
                    final_chunks.extend(self._merge_splits(good_splits, join_sep))
                    good_splits = []
                if not remaining:
                    final_chunks.append(s)
                else:
                    final_chunks.extend(self._split_text_recursive(s, remaining))

        if good_splits:
            final_chunks.extend(self._merge_splits(good_splits, join_sep))

        return final_chunks

    def _merge_splits(self, splits: Iterable[str], separator: str) -> list[str]:
        """
        Merge small pieces into chunk_size-bounded chunks with chunk_overlap
        """
        sep_len = self.length_function(separator)
        chunks: list[str] = []

        cur_pieces: list[str] = []
        total_len = 0

        for piece in splits:
            piece_len = self.length_function(piece)
            prospective = total_len + piece_len + (sep_len if cur_pieces else 0)

            if prospective > self.chunk_size:
                if total_len > self.chunk_size:
                    pass
                if cur_pieces:
                    doc = self._join(cur_pieces, separator)
                    if doc is not None:
                        chunks.append(doc)

                while total_len > self.chunk_overlap or (
                    total_len + piece_len + (sep_len if cur_pieces else 0) > self.chunk_size
                    and total_len > 0
                ):
                    total_len -= self.length_function(cur_pieces[0]) + (
                        sep_len if len(cur_pieces) > 1 else 0
                    )
                    cur_pieces = cur_pieces[1:]

            cur_pieces.append(piece)
            total_len += piece_len + (sep_len if len(cur_pieces) > 1 else 0)

        doc = self._join(cur_pieces, separator)
        if doc is not None:
            chunks.append(doc)

        return chunks

    def _join(self, parts: list[str], separator: str) -> None | str:
        if not parts:
            return None
        text = separator.join(parts)
        if self.strip_whitespace:
            text = text.strip()
        return text if text != "" else None