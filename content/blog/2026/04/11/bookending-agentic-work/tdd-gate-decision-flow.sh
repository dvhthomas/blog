# tool_name not in {Edit, Write, MultiEdit}  -> allow
# CALCMARK_TDD_OFF=1                          -> allow (noisy warning)
# file_path not in watched scope              -> allow
# source file has @tdd-exempt pragma          -> allow
# sibling test file exists                    -> allow
# otherwise                                   -> block (exit 2)
