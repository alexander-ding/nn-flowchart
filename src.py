def is_permutation(s1, s2):
    """ Returns if s2 is a permutation of s1. 
    """
    # quick check: if lengths aren't equal, then False
    if len(s1) != len(s2):
        return False
    if len(s1) == 0:
        return True
    
    first_letter_s1 = s1[0]
    indices_to_check = []
    for char in s2:
        if first_letter_s1 == char:
            indices_to_check.append(first_letter_s1)
    
    for index in indices_to_check:
        is_true = True
        for i in range(len(s1)):
            if s1[i+index % len(s1)] != s2[i]:
                is_true = False
                break
        if is_true:
            return True

    return False